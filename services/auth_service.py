"""
Authentication Service — Supabase Edition
Handles:
  - Email/password login via Supabase Auth
  - JWT session token verification
  - Admin-only user management (create / list / delete)
  - Role assignment via Supabase user_metadata
"""
import os
import logging
from typing import Optional, Dict, Any, List

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_supabase_client = None
_supabase_admin_client = None


def _get_supabase():
    """Returns a cached Supabase client (anon/user-level)."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or "your-project-id" in SUPABASE_URL:
            raise RuntimeError(
                "SUPABASE_URL is not configured. "
                "Add it to your .env file: SUPABASE_URL=https://xxxxx.supabase.co"
            )
        if not SUPABASE_SERVICE_ROLE_KEY or "your-service-role" in SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_SERVICE_ROLE_KEY is not configured. "
                "Add it to your .env file."
            )
        try:
            from supabase import create_client, Client
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except ImportError:
            raise RuntimeError(
                "supabase package not installed. Run: pip install supabase"
            )
    return _supabase_client


def _get_admin_client():
    """Returns a Supabase Admin client using the service role key."""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        if not SUPABASE_URL or "your-project-id" in SUPABASE_URL:
            raise RuntimeError("SUPABASE_URL is not configured in .env")
        if not SUPABASE_SERVICE_ROLE_KEY or "your-service-role" in SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured in .env")
        try:
            from supabase import create_client
            _supabase_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except ImportError:
            raise RuntimeError("supabase package not installed. Run: pip install supabase")
    return _supabase_admin_client


# ────────────────────────────────────────────────────────────────────
# Login / Session
# ────────────────────────────────────────────────────────────────────

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticates a user with email + password via Supabase.
    Returns a dict with { token, email, name, role } on success, else None.
    """
    try:
        client = _get_supabase()
        response = client.auth.sign_in_with_password({
            "email": email.strip().lower(),
            "password": password
        })

        if not response or not response.session:
            logger.warning(f"Auth failed for {email}: no session returned")
            return None

        user = response.user
        session = response.session

        # Extract role from user_metadata (set when admin creates user)
        metadata = user.user_metadata or {}
        role = metadata.get("role", "viewer")
        name = metadata.get("name", email.split("@")[0].title())

        return {
            "token": session.access_token,
            "refresh_token": session.refresh_token,
            "email": user.email,
            "name": name,
            "role": role,
            "user_id": str(user.id)
        }

    except RuntimeError as e:
        logger.error(f"Supabase config error: {e}")
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "invalid login" in error_msg or "invalid credentials" in error_msg or "email not confirmed" in error_msg:
            logger.info(f"Invalid credentials for {email}")
            return None
        logger.error(f"Authentication error for {email}: {e}", exc_info=True)
        return None


def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a Supabase JWT access token.
    Returns user profile dict on success, None if invalid/expired.
    """
    if not token:
        return None
    try:
        client = _get_supabase()
        response = client.auth.get_user(token)

        if not response or not response.user:
            return None

        user = response.user
        metadata = user.user_metadata or {}
        role = metadata.get("role", "viewer")
        name = metadata.get("name", (user.email or "").split("@")[0].title())

        return {
            "email": user.email,
            "name": name,
            "role": role,
            "user_id": str(user.id)
        }
    except RuntimeError:
        raise
    except Exception as e:
        logger.debug(f"Token verification failed: {e}")
        return None


def revoke_session(token: str) -> bool:
    """Signs out the user from Supabase (invalidates the JWT)."""
    if not token:
        return True
    try:
        client = _get_supabase()
        client.auth.sign_out()
        return True
    except Exception as e:
        logger.warning(f"Sign out error (non-critical): {e}")
        return True


# ────────────────────────────────────────────────────────────────────
# Admin User Management
# ────────────────────────────────────────────────────────────────────

def admin_create_user(email: str, password: str, role: str = "viewer", name: str = "") -> Dict[str, Any]:
    """
    Creates a new user in Supabase (Admin API).
    Sets role and name in user_metadata.
    Only callable with the service_role key.
    """
    try:
        client = _get_admin_client()
        user_name = name.strip() or email.split("@")[0].title()

        response = client.auth.admin.create_user({
            "email": email.strip().lower(),
            "password": password,
            "email_confirm": True,    # Skip email confirmation — admin is creating it
            "user_metadata": {
                "role": role,
                "name": user_name
            }
        })

        if not response or not response.user:
            return {"success": False, "error": "Failed to create user in Supabase"}

        return {
            "success": True,
            "user_id": str(response.user.id),
            "email": response.user.email,
            "role": role,
            "name": user_name
        }

    except RuntimeError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        error_str = str(e)
        if "already registered" in error_str.lower() or "already been registered" in error_str.lower():
            return {"success": False, "error": f"User with email '{email}' already exists."}
        logger.error(f"Error creating user {email}: {e}", exc_info=True)
        return {"success": False, "error": error_str}


def admin_list_users() -> Dict[str, Any]:
    """
    Lists all users in Supabase Auth (Admin API).
    Returns list of user objects with email, role, name, created_at.
    """
    try:
        client = _get_admin_client()
        response = client.auth.admin.list_users()

        users = []
        for u in (response or []):
            metadata = getattr(u, "user_metadata", {}) or {}
            users.append({
                "user_id": str(u.id),
                "email": u.email,
                "role": metadata.get("role", "viewer"),
                "name": metadata.get("name", (u.email or "").split("@")[0].title()),
                "created_at": str(u.created_at) if u.created_at else "",
                "last_sign_in": str(u.last_sign_in_at) if getattr(u, "last_sign_in_at", None) else "Never"
            })

        return {"success": True, "users": users, "total": len(users)}

    except RuntimeError as e:
        return {"success": False, "error": str(e), "users": []}
    except Exception as e:
        logger.error(f"Error listing users: {e}", exc_info=True)
        return {"success": False, "error": str(e), "users": []}


def admin_delete_user(user_id: str) -> Dict[str, Any]:
    """
    Deletes a user from Supabase Auth by their UUID.
    Only callable by admin with service_role key.
    """
    try:
        client = _get_admin_client()
        client.auth.admin.delete_user(user_id)
        return {"success": True, "deleted_user_id": user_id}

    except RuntimeError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def admin_update_user_role(user_id: str, role: str) -> Dict[str, Any]:
    """
    Updates the role of an existing user in Supabase user_metadata.
    """
    try:
        client = _get_admin_client()
        response = client.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": {"role": role}}
        )
        if not response or not response.user:
            return {"success": False, "error": "User not found"}

        return {"success": True, "user_id": user_id, "new_role": role}

    except RuntimeError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Error updating role for {user_id}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


# ────────────────────────────────────────────────────────────────────
# Backward-compat shim for old change_password calls
# ────────────────────────────────────────────────────────────────────
def change_password(current_password: str, new_password: str):
    """
    Legacy shim — password changes are now handled via Supabase dashboard
    or by having the user reset via email. This endpoint is kept for
    API compatibility but returns a descriptive message.
    """
    return False, (
        "Password changes are managed via Supabase. "
        "Use the Supabase dashboard or trigger a password reset email."
    )
