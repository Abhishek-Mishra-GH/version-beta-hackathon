from fhir.resources.bundle import Bundle
from fhir.resources.observation import Observation
from fhir.resources.patient import Patient

def create_fhir_bundle(patient_id: str, entities: list) -> dict:
    bundle = Bundle.construct()
    bundle.type = "collection"
    bundle.entry = []

    patient = Patient.construct(id=patient_id)
    bundle.entry.append({"resource": patient})

    for e in entities:
        if e['label_'] in ["LAB_TEST", "VITAL_SIGN"]:
            obs = Observation.construct()
            obs.status = "final"
            obs.subject = {"reference": f"Patient/{patient_id}"}
            obs.code = {"text": e['text']}
            bundle.entry.append({"resource": obs})

    return bundle.dict()