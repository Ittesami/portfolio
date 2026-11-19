Everything you need to know about the exam itself before you start studying: what's on it, how it's marked, and how to prepare.

## The exam at a glance

| Item | Detail |
|---|---|
| Code | CLF-C02 |
| Questions | 65: 50 scored + 15 unscored (you can't tell which, so treat all as real) |
| Types | Multiple choice (1 correct of 4) and multiple response (2+ correct of 5; it tells you how many) |
| Time | 90 minutes, or **120 with ESL +30** |
| Scoring | Scaled 100–1000, **pass mark 700** |
| Penalty for wrong answers | None, so **never leave a question blank** |
| Results | Usually within 5 business days (often sooner by email) |
| Valid for | 3 years |
| Where | Pearson VUE test centre, or online at home (OnVUE) |
| Cost | US$100, about £78–85 with VAT from the UK |

The score is **compensatory**: you pass on your overall score, not per domain. A weak area can be made up elsewhere.

## What it covers

| Domain | Weight | Course modules |
|---|---|---|
| 1. Cloud Concepts | 24% | 1, 12, 13 |
| 2. Security and Compliance | **30%** | 9, 10 |
| 3. Cloud Technology and Services | **34%** | 2–8 |
| 4. Billing, Pricing, and Support | 12% | 11 |

Security + Technology = **64%** of the exam. Spend most of your time there.

## What it really tests

CLF-C02 is **broad, not deep**. Most questions look like:

> A company needs X. Which AWS service or feature should it use?

So for every service, learn **one line**: the problem it solves. Then learn the classic **look-alike pairs**, because the wrong answers are usually the look-alike:

| These get mixed up | Tell them apart by |
|---|---|
| CloudWatch / CloudTrail / Config | performance metrics / who did what / configuration history |
| Security groups / network ACLs | instance, stateful, allow only / subnet, stateless, allow + deny |
| Shield / WAF / GuardDuty / Inspector / Macie | DDoS / web exploits / threat detection / vulnerability scans / sensitive data in S3 |
| Cost Explorer / Budgets / Pricing Calculator | past spend / alerts on future spend / estimate before building |
| RDS-Aurora / DynamoDB / Redshift | relational / NoSQL key-value / data warehouse |
| EBS / EFS / S3 | block, one AZ / shared file system / objects |

## How to prepare (about 3 weeks, 1–2 hours a day)

1. **Week 1, learn.** Read each lesson here alongside the Cloud Practitioner Essentials course on AWS Skill Builder. Then do that module's practice questions **without looking** at the notes.
2. **Week 2, hands-on.** Do the six tasks in the Hands-on module: ten minutes of clicking makes a service stick far better than reading about it.
3. **Week 3, practice exams.** Take full timed practice tests. **Book the exam once you're scoring 80%+ consistently.** Review every wrong answer and every lucky guess.

## Booking

- Book at aws.training (Certification). Online slots are often available within a day or two; weekends fill first. Bristol also has Pearson VUE test centres.
- **Request ESL +30 before you book.** As a non-native English speaker you get 30 extra minutes. Request it once in your AWS Certification account (Request Exam Accommodations → ESL +30 MINUTES); it doesn't apply to an exam that's already booked.
- You can cancel or reschedule free up to 24 hours before.
- After you pass, you get a **50% voucher** for your next AWS exam.

## Online exam rules (OnVUE)

- Run the Pearson VUE **system test** on the same laptop and network beforehand. No mobile hotspot.
- Check in up to 30 minutes early: ID photo, room photos, webcam scan.
- Clear desk, nobody else in the room, no phone within reach, no breaks. Don't read questions aloud or look away from the screen for long.

## Exam-day tactics

- **Pace:** 90 min ÷ 65 questions ≈ 80 seconds each. Answer everything on the first pass, **flag** what you're unsure of, and come back.
- **Eliminate:** two options are usually obviously wrong. Pick between the other two using the keyword.
- **Keywords decide the answer:**
  - "least operational overhead", "fully managed" → serverless or managed service
  - "lowest cost, can tolerate interruption" → Spot Instances
  - "steady workload for 1–3 years" → Savings Plans or Reserved Instances
  - "who deleted…" → CloudTrail
  - "global, low latency for static content" → CloudFront
- **Multiple response:** pick exactly the number asked. There's no partial credit.
- **AWS answers favour AWS best practice:** least privilege, MFA, managed services, multiple AZs, automation.

## Check yourself

1. How many questions does the exam have, and how many count?
2. Should you ever leave a question blank?
3. Which two domains together make up almost two-thirds of the exam?

### Answers

1. 65 questions; 50 are scored and 15 are unscored (unmarked, so answer all of them properly).
2. No: there's no penalty for wrong answers, so always pick something.
3. Cloud Technology and Services (34%) and Security and Compliance (30%).
