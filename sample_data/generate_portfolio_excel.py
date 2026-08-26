"""
Generates a sample multi-tab Excel file with 4 sheets for testing.
"""
import os
import pandas as pd

def generate():
    out_dir = os.path.dirname(__file__)
    out_file = os.path.join(out_dir, 'portfolio_multi_sheet.xlsx')

    actions_data = [
        {"Company": "Aarna", "Function": "Product", "Item": "AI Personalization Recommendation Engine", "Status": "WIP", "Owner": "Kiran", "Founder Dependency": "None", "Comments": "In testing phase"},
        {"Company": "Aarna", "Function": "GTM", "Item": "Demand-Side B2B Channel Launch", "Status": "To Start", "Owner": "Nikhil", "Founder Dependency": "To Review", "Comments": "Focus on UAE transit tourism"},
        {"Company": "Abhee", "Function": "Product", "Item": "Trips Section Design and Interactive Gestures", "Status": "WIP", "Owner": "Vishwa", "Founder Dependency": "None", "Comments": "LiveKit regression complete"},
        {"Company": "Abhee", "Function": "GTM", "Item": "UAE Supplier and Creator Partnership Onboarding", "Status": "Done", "Owner": "Nikhil", "Founder Dependency": "None", "Comments": "2900 experiences added"},
        {"Company": "Miraee", "Function": "Product", "Item": "Revenue Generation Engine & Onboarding Flow", "Status": "To Start", "Owner": "Sailaja", "Founder Dependency": "None", "Comments": "Next 15 days sprint"}
    ]

    decisions_data = [
        {"Decision": "UAE GTM Expansion Execution Plan", "Owner": "Nikhil", "Status": "WIP", "Founder Dependency": "To Review", "Impact if delayed": "Loss of 1st mover market penetration", "Deadline": "2026-09-15"},
        {"Decision": "AI LLM Routing & Cost Optimization Strategy", "Owner": "Hemanth", "Status": "To Start", "Founder Dependency": "To Review", "Impact if delayed": "Higher API inference costs", "Deadline": "2026-09-10"},
        {"Decision": "Creatorpreneur Monetization Model", "Owner": "Kiran", "Status": "To Start", "Founder Dependency": "Decision", "Impact if delayed": "Delay in supply network rollout", "Deadline": "2026-09-20"}
    ]

    priorities_data = [
        {"Priority": "1.0", "Group": "Pranik Products", "Focus Area": "P4P / P4D / P4H Integration", "Why": "Product readiness for rapid GTM rollout", "Horizon": "Next 15 days"},
        {"Priority": "2.0", "Group": "Pranik GTM", "Focus Area": "Indian Army & SPV Partnerships", "Why": "Data source for SLMs and market leadership", "Horizon": "Next 30 days"},
        {"Priority": "3.0", "Group": "Aarna Product", "Focus Area": "Digital Stores & Whitelight Platform", "Why": "Core feature set readiness for creators", "Horizon": "Next 30 days"}
    ]

    # Dedicated Company tab (Sheet name = Company Name!)
    pranik_data = [
        {"Function": "Product", "Item": "CDSS and Scribe Auto-Doctor Assignment", "Status": "Done", "Owner": "Praveen", "Founder Dependency": "None", "Comments": "Deployed in pilot clinic"},
        {"Function": "Product", "Item": "Cancer Constant Care Support Module", "Status": "On Hold", "Owner": "Natesh", "Founder Dependency": "Decision", "Comments": "Reviewing Phase-1 priority"},
        {"Function": "GTM", "Item": "Kiosk White-Label Hardware Evaluation", "Status": "Done", "Owner": "Karthik", "Founder Dependency": "None", "Comments": "Hardware specs finalized"}
    ]

    with pd.ExcelWriter(out_file, engine='openpyxl') as writer:
        pd.DataFrame(actions_data).to_excel(writer, sheet_name='Actions', index=False)
        pd.DataFrame(decisions_data).to_excel(writer, sheet_name='Decisions', index=False)
        pd.DataFrame(priorities_data).to_excel(writer, sheet_name='Priorities', index=False)
        pd.DataFrame(pranik_data).to_excel(writer, sheet_name='Pranik', index=False)

    print(f"Created multi-sheet Excel file: {out_file}")

if __name__ == '__main__':
    generate()
