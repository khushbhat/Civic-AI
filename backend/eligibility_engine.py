from typing import Dict, Any, List, Tuple
from .schemas import Profile, EligibilityFieldStatus

def evaluate_scheme(profile: Profile, scheme: Any) -> Tuple[int, str, List[EligibilityFieldStatus]]:
    """
    Evaluates a user profile against a given scheme.
    Returns: (match_percentage, status, per_criterion_results)
    """
    results = []
    
    # We will track evaluated criteria and passed criteria.
    total_criteria = 0
    passed_criteria = 0
    
    # 1. Gender
    if scheme.eligibility_gender:
        total_criteria += 1
        if not profile.gender:
            results.append(EligibilityFieldStatus(criterion="gender", status="unknown", reason="Gender not provided in profile."))
        elif profile.gender.lower() == scheme.eligibility_gender.lower():
            passed_criteria += 1
            results.append(EligibilityFieldStatus(criterion="gender", status="pass", reason=f"Matches required gender: {scheme.eligibility_gender}."))
        else:
            results.append(EligibilityFieldStatus(criterion="gender", status="fail", reason=f"Requires gender {scheme.eligibility_gender}, but profile is {profile.gender}."))

    # 2. Category
    if scheme.eligibility_category:
        total_criteria += 1
        if not profile.category:
            results.append(EligibilityFieldStatus(criterion="category", status="unknown", reason="Category not provided in profile."))
        else:
            # handle cases like "OBC/EBC/DNT"
            allowed_categories = [c.strip().upper() for c in scheme.eligibility_category.split('/')]
            if profile.category.upper() in allowed_categories:
                passed_criteria += 1
                results.append(EligibilityFieldStatus(criterion="category", status="pass", reason=f"Matches required category: {scheme.eligibility_category}."))
            else:
                results.append(EligibilityFieldStatus(criterion="category", status="fail", reason=f"Requires one of {scheme.eligibility_category}, but profile is {profile.category}."))

    # 3. Income
    if scheme.eligibility_income_max is not None:
        total_criteria += 1
        if profile.income is None:
            results.append(EligibilityFieldStatus(criterion="income", status="unknown", reason="Income not provided in profile."))
        elif profile.income <= scheme.eligibility_income_max:
            passed_criteria += 1
            results.append(EligibilityFieldStatus(criterion="income", status="pass", reason=f"Income is below the maximum limit of ₹{scheme.eligibility_income_max}."))
        else:
            results.append(EligibilityFieldStatus(criterion="income", status="fail", reason=f"Income exceeds the maximum limit of ₹{scheme.eligibility_income_max}."))

    # 4. Target Groups (e.g. Disability, Female, etc.)
    # If the scheme targets a specific group, we can check.
    if scheme.target_groups and "disability" in [tg.lower() for tg in scheme.target_groups]:
        total_criteria += 1
        if not profile.disability_status or profile.disability_status.lower() == "none":
            results.append(EligibilityFieldStatus(criterion="disability", status="fail", reason="Scheme requires a disability, but none provided."))
        else:
            passed_criteria += 1
            results.append(EligibilityFieldStatus(criterion="disability", status="pass", reason="Profile indicates a disability status."))

    # Note: Other fields like education_level or course_level could be evaluated, but
    # for MVP, we might treat them loosely or as unknown if they don't exactly match a strict vocabulary.
    # To keep it simple, we'll check them if they are strictly defined in scheme.
    
    if total_criteria == 0:
        # If no strict numerical/categorical criteria to check against the profile
        return (100, "likely_eligible", results)
        
    match_percentage = int((passed_criteria / total_criteria) * 100)
    
    status = "not_eligible"
    if any(res.status == "fail" for res in results):
        status = "not_eligible"
    elif match_percentage == 100:
        status = "likely_eligible"
    elif any(res.status == "unknown" for res in results):
        status = "possibly_eligible"
    
    if total_criteria > 0 and passed_criteria == 0 and all(res.status == "unknown" for res in results):
        status = "insufficient_data"
        match_percentage = 0

    return match_percentage, status, results
