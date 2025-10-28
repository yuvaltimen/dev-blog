---
layout: project
title: Haiku API
subtitle: 5, 7, 5
media: /assets/images/haiku_logo.png
---

## I made a Haiku API

Hit the POST endpoint with a JSON payload - any JSON payload!
It will turn it into a Haiku.

Link:
[https://kookooreekoo.app.n8n.cloud/webhook/659df7e0-8e9e-4629-99f2-063c5284ac52](https://kookooreekoo.app.n8n.cloud/webhook/659df7e0-8e9e-4629-99f2-063c5284ac52
)

#### Example

Here's how you provide the Haiku context:
```python
{
    "topic": "ancient rome",
    "mood": "whimsical",
    "name": "Bingus"
}
```

Then literally just stick it into a POST request:
```zsh
curl --location 'https://kookooreekoo.app.n8n.cloud/webhook/659df7e0-8e9e-4629-99f2-063c5284ac52' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "ancient rome",
    "mood": "whimsical",
    "name": "Bingus"
}'
```

Voila:

```python
{
    "output": "Bingus skips through time,  \nRome's arches grin and jest bright—  \nWhimsy cloaked in stone."
}
```

#### Here's another one:

POST Request payload:
```python
{
  "patient_id": "P123456",
  "name": "John Doe",
  "age": 45,
  "gender": "male",
  "blood_type": "O+",
  "diagnosis": "Type 2 Diabetes Mellitus",
  "symptoms": ["fatigue", "frequent urination", "blurred vision"],
  "medication": "Metformin",
  "dosage_mg": 500,
  "frequency": "twice daily",
  "allergies": ["penicillin"],
  "last_visit_date": "2025-10-15",
  "next_appointment": "2025-11-20",
  "treatment_plan": "Diet modification, exercise, oral medication",
  "primary_physician": "Dr. Alice Nguyen"
}
```

Output:
```python
{
    "output": "John’s steady journey,  \nBattling shadows with strength—  \nHope in each new dawn."
}
```

Is it the craziest thing I've ever build?

No.

But I used n8n to make it, so it's worth showing!

