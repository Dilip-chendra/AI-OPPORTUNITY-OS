from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import uuid


class DeadlineAutopilotService:
    """
    Generates a realistic day-by-day execution plan for an opportunity pursuit
    based on the number of days remaining until the deadline.
    
    Plans are adaptive:
    - > 30 days: full comprehensive plan
    - 15-30 days: compressed plan
    - 7-14 days: critical path only
    - < 7 days: emergency sprint plan
    """

    FULL_PLAN_TEMPLATE = [
        {'offset': 0,   'milestone': 'Bid Decision Confirmed',    'description': 'Formal go/no-go decision recorded. Assign pursuit lead and team.'},
        {'offset': 1,   'milestone': 'Kick-off Meeting',          'description': 'Brief all team members. Review opportunity scope and requirements.'},
        {'offset': 2,   'milestone': 'Requirements Analysis',     'description': 'Deep-read RFP/tender document. Extract mandatory requirements and evaluation criteria.'},
        {'offset': 3,   'milestone': 'Compliance Checklist Created','description': 'Build compliance matrix mapping requirements to available evidence.'},
        {'offset': 5,   'milestone': 'Evidence Gap Assessment',   'description': 'Identify missing certifications, financials, or documents. Begin procurement.'},
        {'offset': 7,   'milestone': 'Technical Approach Draft',  'description': 'Draft technical solution narrative, methodology, and delivery model.'},
        {'offset': 10,  'milestone': 'Pricing Strategy Locked',   'description': 'Finalize commercial pricing, cost model, and margin structure.'},
        {'offset': 14,  'milestone': 'Draft Proposal Ready',      'description': 'Full proposal draft (executive summary, technical, commercial, team).'},
        {'offset': 16,  'milestone': 'Internal Review Cycle 1',   'description': 'Senior review for compliance gaps and commercial accuracy.'},
        {'offset': 18,  'milestone': 'Revisions Complete',        'description': 'Incorporate review feedback. Polish all sections.'},
        {'offset': 21,  'milestone': 'Final Compliance Check',    'description': 'Cross-verify every mandatory requirement against the submitted document.'},
        {'offset': 23,  'milestone': 'Submission Portal Check',   'description': 'Verify portal access, submission format, and file size limits.'},
        {'offset': 25,  'milestone': 'Final Submission',          'description': 'Submit all documents via the required channel before deadline.'},
        {'offset': 26,  'milestone': 'Confirmation Received',     'description': 'Obtain and archive submission confirmation/acknowledgement.'},
    ]

    COMPRESSED_PLAN_TEMPLATE = [
        {'offset': 0,  'milestone': 'Go Decision & Team Briefing',  'description': 'Assign lead. Brief team on scope and deadline.'},
        {'offset': 1,  'milestone': 'Requirements Deep-Dive',        'description': 'Extract all mandatory requirements and evaluation weights.'},
        {'offset': 2,  'milestone': 'Evidence & Gap Check',          'description': 'Identify compliance gaps. Expedite any missing documents.'},
        {'offset': 4,  'milestone': 'Technical Draft',               'description': 'Draft technical approach and proposed solution.'},
        {'offset': 6,  'milestone': 'Commercial Pricing',            'description': 'Lock pricing and commercial structure.'},
        {'offset': 8,  'milestone': 'Full Proposal Draft',           'description': 'Assemble all sections into submission-ready document.'},
        {'offset': 10, 'milestone': 'Review & Revise',               'description': 'Internal review cycle with targeted revisions.'},
        {'offset': 12, 'milestone': 'Final Compliance Sweep',        'description': 'Verify all mandatory requirements satisfied.'},
        {'offset': 13, 'milestone': 'Submission',                    'description': 'Submit all documents. Obtain confirmation.'},
    ]

    CRITICAL_PATH_TEMPLATE = [
        {'offset': 0,  'milestone': 'Emergency Go Decision',     'description': 'Assign full team immediately. Maximum resource mobilization.'},
        {'offset': 0,  'milestone': 'Requirements Extraction',   'description': 'Same day: extract all mandatory requirements from RFP.'},
        {'offset': 1,  'milestone': 'Evidence Assembly',         'description': 'Assemble all available compliance documents.'},
        {'offset': 2,  'milestone': 'Technical Draft',           'description': 'Rapid technical approach document.'},
        {'offset': 3,  'milestone': 'Commercial Pricing',        'description': 'Lock pricing immediately.'},
        {'offset': 4,  'milestone': 'Rapid Proposal Assembly',   'description': 'Combine all sections into submission package.'},
        {'offset': 5,  'milestone': 'Final Review & Submit',     'description': 'Quick review pass, submit before deadline.'},
    ]

    def generate_plan(
        self,
        deadline: Optional[datetime],
        submission_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Generate the execution plan given a deadline datetime."""
        now = datetime.now(timezone.utc)

        if not deadline:
            # No deadline — generate a generic 30-day full plan
            base_date = now
            days_left = 30
            template = self.FULL_PLAN_TEMPLATE
        else:
            dl = deadline if deadline.tzinfo else deadline.replace(tzinfo=timezone.utc)
            days_left = max(0, (dl - now).days)
            base_date = now

            if days_left >= 30:
                template = self.FULL_PLAN_TEMPLATE
            elif days_left >= 15:
                template = self.COMPRESSED_PLAN_TEMPLATE
            elif days_left >= 7:
                template = self.CRITICAL_PATH_TEMPLATE
            else:
                # Under 7 days: emergency plan scaled to available time
                scale = days_left / 7.0
                template = [
                    {**item, 'offset': max(0, int(item['offset'] * scale))}
                    for item in self.CRITICAL_PATH_TEMPLATE
                ]

        plan = []
        for item in template:
            due = base_date + timedelta(days=item['offset'])
            is_overdue = due < now
            plan.append({
                'day_offset': item['offset'],
                'milestone': item['milestone'],
                'description': item['description'],
                'due_date': due.strftime('%Y-%m-%d'),
                'status': 'overdue' if is_overdue else 'pending',
            })

        return plan


deadline_service = DeadlineAutopilotService()
