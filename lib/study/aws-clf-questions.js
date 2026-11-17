// AWS Certified Cloud Practitioner (CLF-C02) practice questions, from Ittehad's study guide
// ("AWS Cloud Practitioner (CLF-C02) Study Guide", Nov 2026). Generated from the .docx; the
// answer key is checked against each question. Server-only: the quiz API marks answers, so
// the browser never sees them before you submit.

export const AWS_CLF_TIPS = {
  "1": "Learn the six advantages word for word",
  "2": "Interruptible = Spot; socket/core licensing = Dedicated Hosts; queue = SQS, fan-out = SNS",
  "3": "Lambda's 15-minute limit; Fargate = serverless containers",
  "4": "CloudFront caches; Global Accelerator doesn't",
  "5": "SG = stateful/allow only; NACL = stateless/allow+deny",
  "6": "\"Milliseconds\" archive = Glacier Instant Retrieval; cheapest archive = Deep Archive",
  "7": "Redshift = analytics, not transactions",
  "8": "Polly speaks, Transcribe listens; Athena = SQL on S3",
  "9": "Roles, not access keys, for apps on EC2",
  "10": "CloudWatch = performance, CloudTrail = who did it, Config = configuration",
  "11": "Calculator = before; Cost Explorer = past; Budgets = alerts",
  "12": "Rehost = no changes; Replatform = small tweaks (e.g. to RDS)",
  "13": "Six pillars; Sustainability is the newest"
};

export const AWS_CLF_QUESTIONS = [
 {
  "id": "m1q1",
  "module": 1,
  "stem": "A start-up wants to avoid spending a large amount on servers before it knows whether its product will succeed. Which advantage of cloud computing does this describe?",
  "options": [
   {
    "key": "A",
    "text": "Benefit from massive economies of scale"
   },
   {
    "key": "B",
    "text": "Trade fixed expense for variable expense"
   },
   {
    "key": "C",
    "text": "Go global in minutes"
   },
   {
    "key": "D",
    "text": "Increase speed and agility"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m1q2",
  "module": 1,
  "stem": "A company runs its new applications on AWS but keeps a legacy payroll system in its own data centre, connected to AWS. Which deployment model is this?",
  "options": [
   {
    "key": "A",
    "text": "Cloud-based"
   },
   {
    "key": "B",
    "text": "On-premises"
   },
   {
    "key": "C",
    "text": "Hybrid"
   },
   {
    "key": "D",
    "text": "Private cloud"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m1q3",
  "module": 1,
  "stem": "Which term describes a system automatically adding resources during a traffic spike and removing them when traffic drops?",
  "options": [
   {
    "key": "A",
    "text": "Fault tolerance"
   },
   {
    "key": "B",
    "text": "Elasticity"
   },
   {
    "key": "C",
    "text": "Durability"
   },
   {
    "key": "D",
    "text": "Multi-tenancy"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m1q4",
  "module": 1,
  "stem": "Which cloud service model gives the customer the most control over the operating system?",
  "options": [
   {
    "key": "A",
    "text": "SaaS"
   },
   {
    "key": "B",
    "text": "PaaS"
   },
   {
    "key": "C",
    "text": "IaaS"
   },
   {
    "key": "D",
    "text": "FaaS"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m1q5",
  "module": 1,
  "stem": "Which TWO are among the six advantages of cloud computing? (Choose two.)",
  "options": [
   {
    "key": "A",
    "text": "Stop guessing capacity"
   },
   {
    "key": "B",
    "text": "Eliminate all security responsibilities"
   },
   {
    "key": "C",
    "text": "Go global in minutes"
   },
   {
    "key": "D",
    "text": "Pay a fixed monthly fee regardless of usage"
   },
   {
    "key": "E",
    "text": "Guaranteed 100% uptime"
   }
  ],
  "answer": [
   "A",
   "C"
  ]
 },
 {
  "id": "m1q6",
  "module": 1,
  "stem": "A developer wants to automate creating resources with repeatable scripts run from a terminal. Which tool fits best?",
  "options": [
   {
    "key": "A",
    "text": "AWS Management Console"
   },
   {
    "key": "B",
    "text": "AWS CLI"
   },
   {
    "key": "C",
    "text": "AWS Marketplace"
   },
   {
    "key": "D",
    "text": "AWS Artifact"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m2q1",
  "module": 2,
  "stem": "A company runs nightly data-processing jobs that can be stopped and restarted at any time. Which EC2 pricing option is the most cost-effective?",
  "options": [
   {
    "key": "A",
    "text": "On-Demand"
   },
   {
    "key": "B",
    "text": "Reserved Instances"
   },
   {
    "key": "C",
    "text": "Spot Instances"
   },
   {
    "key": "D",
    "text": "Dedicated Hosts"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m2q2",
  "module": 2,
  "stem": "A company has a steady compute workload for the next 3 years and wants the discount to apply across EC2 instance families, AWS Fargate and AWS Lambda. Which option should it choose?",
  "options": [
   {
    "key": "A",
    "text": "Standard Reserved Instances"
   },
   {
    "key": "B",
    "text": "Compute Savings Plans"
   },
   {
    "key": "C",
    "text": "Spot Instances"
   },
   {
    "key": "D",
    "text": "On-Demand Capacity Reservations"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m2q3",
  "module": 2,
  "stem": "A company must use existing server-bound software licences that are tied to physical CPU sockets. Which EC2 option meets this requirement?",
  "options": [
   {
    "key": "A",
    "text": "Dedicated Hosts"
   },
   {
    "key": "B",
    "text": "Dedicated Instances"
   },
   {
    "key": "C",
    "text": "Spot Instances"
   },
   {
    "key": "D",
    "text": "On-Demand Instances"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m2q4",
  "module": 2,
  "stem": "Which instance family is best suited to training deep-learning models?",
  "options": [
   {
    "key": "A",
    "text": "Memory optimised"
   },
   {
    "key": "B",
    "text": "Storage optimised"
   },
   {
    "key": "C",
    "text": "Accelerated computing"
   },
   {
    "key": "D",
    "text": "General purpose"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m2q5",
  "module": 2,
  "stem": "Which service distributes incoming application traffic across multiple EC2 instances in multiple Availability Zones?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Route 53"
   },
   {
    "key": "B",
    "text": "Elastic Load Balancing"
   },
   {
    "key": "C",
    "text": "Amazon EC2 Auto Scaling"
   },
   {
    "key": "D",
    "text": "Amazon CloudFront"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m2q6",
  "module": 2,
  "stem": "An order system should keep orders waiting safely if the processing service is temporarily down, then process them when it recovers. Which service should sit between the two components?",
  "options": [
   {
    "key": "A",
    "text": "Amazon SNS"
   },
   {
    "key": "B",
    "text": "Amazon SQS"
   },
   {
    "key": "C",
    "text": "AWS Lambda"
   },
   {
    "key": "D",
    "text": "Amazon CloudWatch"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m2q7",
  "module": 2,
  "stem": "An application must send the same alert by email and SMS to many subscribers at once. Which service fits?",
  "options": [
   {
    "key": "A",
    "text": "Amazon SQS"
   },
   {
    "key": "B",
    "text": "Amazon SNS"
   },
   {
    "key": "C",
    "text": "Amazon EventBridge Scheduler"
   },
   {
    "key": "D",
    "text": "AWS Step Functions"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m2q8",
  "module": 2,
  "stem": "In an Auto Scaling group, what does the minimum capacity setting define?",
  "options": [
   {
    "key": "A",
    "text": "The number of instances launched only during peak hours"
   },
   {
    "key": "B",
    "text": "The smallest number of instances that will always be running"
   },
   {
    "key": "C",
    "text": "The cost limit for the group"
   },
   {
    "key": "D",
    "text": "The number of Availability Zones used"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m3q1",
  "module": 3,
  "stem": "A company wants to automatically create a thumbnail every time an image is uploaded to an S3 bucket, without managing servers. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon EC2"
   },
   {
    "key": "B",
    "text": "AWS Lambda"
   },
   {
    "key": "C",
    "text": "Amazon Lightsail"
   },
   {
    "key": "D",
    "text": "AWS Outposts"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m3q2",
  "module": 3,
  "stem": "Which workload is NOT a good fit for AWS Lambda?",
  "options": [
   {
    "key": "A",
    "text": "Resizing images on upload"
   },
   {
    "key": "B",
    "text": "A video-rendering job that runs for 3 hours"
   },
   {
    "key": "C",
    "text": "Processing messages from an SQS queue"
   },
   {
    "key": "D",
    "text": "Responding to API requests"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m3q3",
  "module": 3,
  "stem": "A company wants to run Docker containers without provisioning or managing any servers. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Fargate"
   },
   {
    "key": "B",
    "text": "Amazon EC2"
   },
   {
    "key": "C",
    "text": "Amazon ECR"
   },
   {
    "key": "D",
    "text": "AWS Batch"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m3q4",
  "module": 3,
  "stem": "A team already uses Kubernetes on-premises and wants a managed Kubernetes service on AWS. Which service should it choose?",
  "options": [
   {
    "key": "A",
    "text": "Amazon ECS"
   },
   {
    "key": "B",
    "text": "Amazon EKS"
   },
   {
    "key": "C",
    "text": "AWS Elastic Beanstalk"
   },
   {
    "key": "D",
    "text": "AWS App Runner"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m3q5",
  "module": 3,
  "stem": "A developer wants to upload a Java web application and have AWS automatically handle capacity provisioning, load balancing and scaling. Which service fits best?",
  "options": [
   {
    "key": "A",
    "text": "AWS Elastic Beanstalk"
   },
   {
    "key": "B",
    "text": "AWS CloudFormation"
   },
   {
    "key": "C",
    "text": "Amazon EC2"
   },
   {
    "key": "D",
    "text": "AWS Lambda"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m3q6",
  "module": 3,
  "stem": "A small business needs a simple WordPress website with a predictable low monthly price. Which service is most suitable?",
  "options": [
   {
    "key": "A",
    "text": "Amazon EKS"
   },
   {
    "key": "B",
    "text": "Amazon Lightsail"
   },
   {
    "key": "C",
    "text": "AWS Outposts"
   },
   {
    "key": "D",
    "text": "Amazon EC2 Dedicated Hosts"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m3q7",
  "module": 3,
  "stem": "A company must run some AWS services in its own data centre to meet data-residency rules. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Local Zones"
   },
   {
    "key": "B",
    "text": "AWS Outposts"
   },
   {
    "key": "C",
    "text": "AWS Direct Connect"
   },
   {
    "key": "D",
    "text": "AWS Snowball Edge"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m4q1",
  "module": 4,
  "stem": "Which TWO factors should a company consider when choosing an AWS Region? (Choose two.)",
  "options": [
   {
    "key": "A",
    "text": "Data-residency and compliance requirements"
   },
   {
    "key": "B",
    "text": "The number of IAM users in the account"
   },
   {
    "key": "C",
    "text": "Proximity to its customers"
   },
   {
    "key": "D",
    "text": "The number of S3 buckets it plans to create"
   },
   {
    "key": "E",
    "text": "The AWS Support plan it has"
   }
  ],
  "answer": [
   "A",
   "C"
  ]
 },
 {
  "id": "m4q2",
  "module": 4,
  "stem": "What is an Availability Zone?",
  "options": [
   {
    "key": "A",
    "text": "A geographic area containing multiple Regions"
   },
   {
    "key": "B",
    "text": "One or more discrete data centres with redundant power and networking within a Region"
   },
   {
    "key": "C",
    "text": "A site that caches content for CloudFront"
   },
   {
    "key": "D",
    "text": "A data centre located in the customer's premises"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m4q3",
  "module": 4,
  "stem": "A company wants to reduce latency for users around the world who download images and videos from its website. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon CloudFront"
   },
   {
    "key": "B",
    "text": "AWS Direct Connect"
   },
   {
    "key": "C",
    "text": "Amazon EBS"
   },
   {
    "key": "D",
    "text": "AWS Outposts"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m4q4",
  "module": 4,
  "stem": "A company wants to make its application highly available. What is the AWS-recommended approach?",
  "options": [
   {
    "key": "A",
    "text": "Run it on one large instance"
   },
   {
    "key": "B",
    "text": "Deploy it across multiple Availability Zones"
   },
   {
    "key": "C",
    "text": "Deploy it in a single Availability Zone with backups"
   },
   {
    "key": "D",
    "text": "Use Dedicated Hosts"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m4q5",
  "module": 4,
  "stem": "A company wants to deploy identical infrastructure in three Regions using templates. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS CloudFormation"
   },
   {
    "key": "B",
    "text": "AWS Config"
   },
   {
    "key": "C",
    "text": "AWS Elastic Beanstalk"
   },
   {
    "key": "D",
    "text": "AWS Systems Manager"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m4q6",
  "module": 4,
  "stem": "A mobile gaming company needs ultra-low latency for players on 5G networks. Which infrastructure option fits?",
  "options": [
   {
    "key": "A",
    "text": "AWS Local Zones"
   },
   {
    "key": "B",
    "text": "AWS Wavelength Zones"
   },
   {
    "key": "C",
    "text": "Edge locations"
   },
   {
    "key": "D",
    "text": "AWS Outposts"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m4q7",
  "module": 4,
  "stem": "Which service improves global application performance using static IP addresses and the AWS global network, without caching content?",
  "options": [
   {
    "key": "A",
    "text": "Amazon CloudFront"
   },
   {
    "key": "B",
    "text": "AWS Global Accelerator"
   },
   {
    "key": "C",
    "text": "Amazon Route 53"
   },
   {
    "key": "D",
    "text": "Elastic Load Balancing"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m5q1",
  "module": 5,
  "stem": "Which service lets a company provision a logically isolated section of the AWS Cloud with its own IP address range?",
  "options": [
   {
    "key": "A",
    "text": "Amazon VPC"
   },
   {
    "key": "B",
    "text": "AWS Direct Connect"
   },
   {
    "key": "C",
    "text": "Amazon Route 53"
   },
   {
    "key": "D",
    "text": "AWS Transit Gateway"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m5q2",
  "module": 5,
  "stem": "Which VPC component allows public internet traffic to reach a web server in a public subnet?",
  "options": [
   {
    "key": "A",
    "text": "Virtual private gateway"
   },
   {
    "key": "B",
    "text": "Internet gateway"
   },
   {
    "key": "C",
    "text": "NAT gateway"
   },
   {
    "key": "D",
    "text": "VPC endpoint"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m5q3",
  "module": 5,
  "stem": "A company needs a dedicated, private network connection from its data centre to AWS that does not travel over the public internet. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Site-to-Site VPN"
   },
   {
    "key": "B",
    "text": "Internet gateway"
   },
   {
    "key": "C",
    "text": "AWS Direct Connect"
   },
   {
    "key": "D",
    "text": "AWS Client VPN"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m5q4",
  "module": 5,
  "stem": "Which is a stateless firewall that controls traffic at the subnet level?",
  "options": [
   {
    "key": "A",
    "text": "Network ACL"
   },
   {
    "key": "B",
    "text": "Security group"
   },
   {
    "key": "C",
    "text": "Route table"
   },
   {
    "key": "D",
    "text": "AWS WAF"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m5q5",
  "module": 5,
  "stem": "By default, what does a newly created security group do?",
  "options": [
   {
    "key": "A",
    "text": "Allows all inbound and all outbound traffic"
   },
   {
    "key": "B",
    "text": "Denies all inbound and all outbound traffic"
   },
   {
    "key": "C",
    "text": "Allows all inbound traffic and denies all outbound traffic"
   },
   {
    "key": "D",
    "text": "Denies all inbound traffic and allows all outbound traffic"
   }
  ],
  "answer": [
   "D"
  ]
 },
 {
  "id": "m5q6",
  "module": 5,
  "stem": "Which service provides DNS and domain-name registration?",
  "options": [
   {
    "key": "A",
    "text": "Amazon CloudFront"
   },
   {
    "key": "B",
    "text": "Amazon Route 53"
   },
   {
    "key": "C",
    "text": "AWS Global Accelerator"
   },
   {
    "key": "D",
    "text": "Elastic Load Balancing"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m5q7",
  "module": 5,
  "stem": "EC2 instances in a private subnet need to download software patches from the internet, but must not accept connections initiated from the internet. What should be used?",
  "options": [
   {
    "key": "A",
    "text": "Internet gateway attached to the private subnet"
   },
   {
    "key": "B",
    "text": "NAT gateway"
   },
   {
    "key": "C",
    "text": "VPC peering"
   },
   {
    "key": "D",
    "text": "Direct Connect"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m5q8",
  "module": 5,
  "stem": "A company wants to connect 40 VPCs and its on-premises network through a single central hub. Which service fits best?",
  "options": [
   {
    "key": "A",
    "text": "VPC peering"
   },
   {
    "key": "B",
    "text": "AWS Transit Gateway"
   },
   {
    "key": "C",
    "text": "Amazon Route 53"
   },
   {
    "key": "D",
    "text": "AWS PrivateLink"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q1",
  "module": 6,
  "stem": "A company needs block storage for an EC2 database that keeps its data after the instance is stopped. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Instance store"
   },
   {
    "key": "B",
    "text": "Amazon EBS"
   },
   {
    "key": "C",
    "text": "Amazon S3"
   },
   {
    "key": "D",
    "text": "Amazon EFS"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q2",
  "module": 6,
  "stem": "A company stores medical images that are accessed only a few times a year but must be retrievable in milliseconds. Which S3 storage class is MOST cost-effective?",
  "options": [
   {
    "key": "A",
    "text": "S3 Standard"
   },
   {
    "key": "B",
    "text": "S3 Glacier Instant Retrieval"
   },
   {
    "key": "C",
    "text": "S3 Glacier Deep Archive"
   },
   {
    "key": "D",
    "text": "S3 Express One Zone"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q3",
  "module": 6,
  "stem": "A company must keep financial records for 7 years at the lowest possible cost and can wait up to 48 hours to retrieve them. Which storage class should it use?",
  "options": [
   {
    "key": "A",
    "text": "S3 Standard-IA"
   },
   {
    "key": "B",
    "text": "S3 One Zone-IA"
   },
   {
    "key": "C",
    "text": "S3 Glacier Deep Archive"
   },
   {
    "key": "D",
    "text": "S3 Intelligent-Tiering"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m6q4",
  "module": 6,
  "stem": "A company has data with unpredictable access patterns and wants AWS to optimise costs automatically. Which storage class fits?",
  "options": [
   {
    "key": "A",
    "text": "S3 Intelligent-Tiering"
   },
   {
    "key": "B",
    "text": "S3 Standard"
   },
   {
    "key": "C",
    "text": "S3 Glacier Flexible Retrieval"
   },
   {
    "key": "D",
    "text": "S3 One Zone-IA"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m6q5",
  "module": 6,
  "stem": "Several Linux EC2 instances in different Availability Zones need to read and write the same files at the same time. Which service should be used?",
  "options": [
   {
    "key": "A",
    "text": "Amazon EBS"
   },
   {
    "key": "B",
    "text": "Instance store"
   },
   {
    "key": "C",
    "text": "Amazon EFS"
   },
   {
    "key": "D",
    "text": "S3 Glacier"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m6q6",
  "module": 6,
  "stem": "When is data on an EC2 instance store volume lost?",
  "options": [
   {
    "key": "A",
    "text": "When the instance is rebooted"
   },
   {
    "key": "B",
    "text": "When the instance is stopped or terminated"
   },
   {
    "key": "C",
    "text": "Only when the AZ fails"
   },
   {
    "key": "D",
    "text": "Never; it is replicated to S3"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q7",
  "module": 6,
  "stem": "A company wants objects in S3 to move automatically to S3 Standard-IA 30 days after creation and be deleted after one year. What should it configure?",
  "options": [
   {
    "key": "A",
    "text": "S3 Versioning"
   },
   {
    "key": "B",
    "text": "S3 Lifecycle policies"
   },
   {
    "key": "C",
    "text": "S3 Replication"
   },
   {
    "key": "D",
    "text": "S3 Object Lock"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q8",
  "module": 6,
  "stem": "A company needs fully managed file storage for Windows applications that use SMB and Active Directory. Which service should it choose?",
  "options": [
   {
    "key": "A",
    "text": "Amazon EFS"
   },
   {
    "key": "B",
    "text": "Amazon FSx for Windows File Server"
   },
   {
    "key": "C",
    "text": "AWS Storage Gateway Tape Gateway"
   },
   {
    "key": "D",
    "text": "Amazon EBS"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m6q9",
  "module": 6,
  "stem": "What is the durability of Amazon S3 Standard?",
  "options": [
   {
    "key": "A",
    "text": "99.9%"
   },
   {
    "key": "B",
    "text": "99.99%"
   },
   {
    "key": "C",
    "text": "99.999999999% (11 nines)"
   },
   {
    "key": "D",
    "text": "100%"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m7q1",
  "module": 7,
  "stem": "A company wants a managed MySQL database where AWS handles patching and automated backups. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon RDS"
   },
   {
    "key": "B",
    "text": "Amazon DynamoDB"
   },
   {
    "key": "C",
    "text": "MySQL installed on Amazon EC2"
   },
   {
    "key": "D",
    "text": "Amazon Redshift"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m7q2",
  "module": 7,
  "stem": "A gaming company needs a serverless NoSQL key-value database with single-digit-millisecond latency at any scale. Which service fits?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Aurora"
   },
   {
    "key": "B",
    "text": "Amazon Neptune"
   },
   {
    "key": "C",
    "text": "Amazon DynamoDB"
   },
   {
    "key": "D",
    "text": "Amazon RDS for PostgreSQL"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m7q3",
  "module": 7,
  "stem": "A company wants to run complex analytical queries over petabytes of historical sales data for business intelligence. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon DynamoDB"
   },
   {
    "key": "B",
    "text": "Amazon Redshift"
   },
   {
    "key": "C",
    "text": "Amazon ElastiCache"
   },
   {
    "key": "D",
    "text": "Amazon DocumentDB"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m7q4",
  "module": 7,
  "stem": "A company wants to migrate an on-premises Oracle database to Amazon Aurora while keeping the source database running during migration. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS DataSync"
   },
   {
    "key": "B",
    "text": "AWS Database Migration Service"
   },
   {
    "key": "C",
    "text": "AWS Snowball Edge"
   },
   {
    "key": "D",
    "text": "AWS Backup"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m7q5",
  "module": 7,
  "stem": "A social-media application needs to store and query complex relationships between users. Which database is the best fit?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Neptune"
   },
   {
    "key": "B",
    "text": "Amazon Redshift"
   },
   {
    "key": "C",
    "text": "Amazon RDS for MySQL"
   },
   {
    "key": "D",
    "text": "Amazon Timestream"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m7q6",
  "module": 7,
  "stem": "A company wants to reduce database load by caching the results of frequent queries in memory. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon ElastiCache"
   },
   {
    "key": "B",
    "text": "Amazon EBS"
   },
   {
    "key": "C",
    "text": "Amazon S3"
   },
   {
    "key": "D",
    "text": "Amazon EFS"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m7q7",
  "module": 7,
  "stem": "A company running MongoDB on-premises wants a managed, compatible database on AWS. Which service should it choose?",
  "options": [
   {
    "key": "A",
    "text": "Amazon DynamoDB"
   },
   {
    "key": "B",
    "text": "Amazon Keyspaces"
   },
   {
    "key": "C",
    "text": "Amazon DocumentDB"
   },
   {
    "key": "D",
    "text": "Amazon Aurora"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m7q8",
  "module": 7,
  "stem": "How does Amazon Aurora provide high durability for its storage?",
  "options": [
   {
    "key": "A",
    "text": "It stores one copy in a single AZ"
   },
   {
    "key": "B",
    "text": "It stores six copies of data across three Availability Zones"
   },
   {
    "key": "C",
    "text": "It backs up to tape every night"
   },
   {
    "key": "D",
    "text": "It uses instance store volumes"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m8q1",
  "module": 8,
  "stem": "A data-science team wants to build, train and deploy its own custom machine-learning models. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Rekognition"
   },
   {
    "key": "B",
    "text": "Amazon SageMaker AI"
   },
   {
    "key": "C",
    "text": "Amazon Comprehend"
   },
   {
    "key": "D",
    "text": "Amazon Polly"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m8q2",
  "module": 8,
  "stem": "A company wants to build a generative AI application using foundation models from several providers through a single API, without managing infrastructure. Which service fits?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Bedrock"
   },
   {
    "key": "B",
    "text": "Amazon EMR"
   },
   {
    "key": "C",
    "text": "Amazon Lex"
   },
   {
    "key": "D",
    "text": "AWS Glue"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m8q3",
  "module": 8,
  "stem": "A company wants to automatically detect faces and objects in uploaded photos. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Textract"
   },
   {
    "key": "B",
    "text": "Amazon Rekognition"
   },
   {
    "key": "C",
    "text": "Amazon Kendra"
   },
   {
    "key": "D",
    "text": "Amazon Translate"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m8q4",
  "module": 8,
  "stem": "A hospital wants to extract text and table data from scanned patient intake forms. Which service is most suitable?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Transcribe"
   },
   {
    "key": "B",
    "text": "Amazon Comprehend"
   },
   {
    "key": "C",
    "text": "Amazon Textract"
   },
   {
    "key": "D",
    "text": "Amazon Polly"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m8q5",
  "module": 8,
  "stem": "A retailer wants to analyse thousands of product reviews to find out whether they are positive or negative. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Comprehend"
   },
   {
    "key": "B",
    "text": "Amazon Lex"
   },
   {
    "key": "C",
    "text": "Amazon Personalize"
   },
   {
    "key": "D",
    "text": "Amazon Rekognition"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m8q6",
  "module": 8,
  "stem": "Which TWO statements are correct? (Choose two.)",
  "options": [
   {
    "key": "A",
    "text": "Amazon Polly converts text into speech"
   },
   {
    "key": "B",
    "text": "Amazon Transcribe converts text into speech"
   },
   {
    "key": "C",
    "text": "Amazon Transcribe converts speech into text"
   },
   {
    "key": "D",
    "text": "Amazon Polly translates text between languages"
   },
   {
    "key": "E",
    "text": "Amazon Lex analyses images"
   }
  ],
  "answer": [
   "A",
   "C"
  ]
 },
 {
  "id": "m8q7",
  "module": 8,
  "stem": "A company stores log files in Amazon S3 and wants to run ad-hoc SQL queries on them without loading them into a database or managing servers. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Redshift"
   },
   {
    "key": "B",
    "text": "Amazon Athena"
   },
   {
    "key": "C",
    "text": "Amazon RDS"
   },
   {
    "key": "D",
    "text": "Amazon EMR"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m8q8",
  "module": 8,
  "stem": "Which service creates interactive business-intelligence dashboards?",
  "options": [
   {
    "key": "A",
    "text": "Amazon QuickSight"
   },
   {
    "key": "B",
    "text": "AWS Glue"
   },
   {
    "key": "C",
    "text": "Amazon Kinesis"
   },
   {
    "key": "D",
    "text": "Amazon CloudWatch"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m8q9",
  "module": 8,
  "stem": "A company needs to collect and process clickstream data from its website in real time. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Glue"
   },
   {
    "key": "B",
    "text": "Amazon Kinesis"
   },
   {
    "key": "C",
    "text": "Amazon Athena"
   },
   {
    "key": "D",
    "text": "AWS Data Exchange"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m8q10",
  "module": 8,
  "stem": "A bank wants to add a conversational chatbot to its website. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Lex"
   },
   {
    "key": "B",
    "text": "Amazon Kendra"
   },
   {
    "key": "C",
    "text": "Amazon Polly"
   },
   {
    "key": "D",
    "text": "Amazon Textract"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m9q1",
  "module": 9,
  "stem": "Under the shared responsibility model, which task is the customer's responsibility when using Amazon EC2?",
  "options": [
   {
    "key": "A",
    "text": "Physical security of data centres"
   },
   {
    "key": "B",
    "text": "Patching the guest operating system"
   },
   {
    "key": "C",
    "text": "Maintaining the hypervisor"
   },
   {
    "key": "D",
    "text": "Replacing failed host hardware"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q2",
  "module": 9,
  "stem": "Which TWO are AWS's responsibility under the shared responsibility model? (Choose two.)",
  "options": [
   {
    "key": "A",
    "text": "Physical security of data centres"
   },
   {
    "key": "B",
    "text": "Configuring security group rules"
   },
   {
    "key": "C",
    "text": "Maintaining the host server hardware"
   },
   {
    "key": "D",
    "text": "Deciding which IAM users can access an S3 bucket"
   },
   {
    "key": "E",
    "text": "Encrypting the customer's application data"
   }
  ],
  "answer": [
   "A",
   "C"
  ]
 },
 {
  "id": "m9q3",
  "module": 9,
  "stem": "What is the AWS-recommended best practice for the root user?",
  "options": [
   {
    "key": "A",
    "text": "Share the credentials with the admin team"
   },
   {
    "key": "B",
    "text": "Use it for daily administrative tasks"
   },
   {
    "key": "C",
    "text": "Enable MFA and use it only for tasks that require root"
   },
   {
    "key": "D",
    "text": "Create access keys for it to use in scripts"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m9q4",
  "module": 9,
  "stem": "An application on EC2 needs to read objects from S3. What is the MOST secure way to give it access?",
  "options": [
   {
    "key": "A",
    "text": "Store an IAM user's access keys on the instance"
   },
   {
    "key": "B",
    "text": "Attach an IAM role to the instance"
   },
   {
    "key": "C",
    "text": "Make the bucket public"
   },
   {
    "key": "D",
    "text": "Use the root user's credentials"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q5",
  "module": 9,
  "stem": "Granting users only the permissions they need to do their jobs is known as:",
  "options": [
   {
    "key": "A",
    "text": "Defence in depth"
   },
   {
    "key": "B",
    "text": "The principle of least privilege"
   },
   {
    "key": "C",
    "text": "Separation of duties"
   },
   {
    "key": "D",
    "text": "Shared responsibility"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q6",
  "module": 9,
  "stem": "An auditor asks for AWS's SOC 2 and PCI DSS compliance reports. Where can the company download them?",
  "options": [
   {
    "key": "A",
    "text": "AWS Artifact"
   },
   {
    "key": "B",
    "text": "AWS Trusted Advisor"
   },
   {
    "key": "C",
    "text": "AWS Config"
   },
   {
    "key": "D",
    "text": "Amazon Inspector"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m9q7",
  "module": 9,
  "stem": "A company wants to protect its web application from SQL injection and cross-site scripting attacks. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Shield Standard"
   },
   {
    "key": "B",
    "text": "AWS WAF"
   },
   {
    "key": "C",
    "text": "Amazon GuardDuty"
   },
   {
    "key": "D",
    "text": "Amazon Macie"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q8",
  "module": 9,
  "stem": "A company needs enhanced DDoS protection with 24/7 access to a specialist response team and protection against DDoS-related scaling charges. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Shield Standard"
   },
   {
    "key": "B",
    "text": "AWS Shield Advanced"
   },
   {
    "key": "C",
    "text": "AWS WAF"
   },
   {
    "key": "D",
    "text": "AWS Firewall Manager"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q9",
  "module": 9,
  "stem": "Which service uses machine learning to discover personally identifiable information stored in Amazon S3?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Macie"
   },
   {
    "key": "B",
    "text": "Amazon Inspector"
   },
   {
    "key": "C",
    "text": "Amazon Detective"
   },
   {
    "key": "D",
    "text": "AWS Security Hub"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m9q10",
  "module": 9,
  "stem": "Which service continuously monitors CloudTrail, VPC Flow Logs and DNS logs to detect malicious activity?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Inspector"
   },
   {
    "key": "B",
    "text": "Amazon GuardDuty"
   },
   {
    "key": "C",
    "text": "AWS Config"
   },
   {
    "key": "D",
    "text": "AWS Artifact"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m9q11",
  "module": 9,
  "stem": "A company wants to scan its EC2 instances and container images for software vulnerabilities automatically. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "Amazon Inspector"
   },
   {
    "key": "B",
    "text": "Amazon Macie"
   },
   {
    "key": "C",
    "text": "AWS Shield"
   },
   {
    "key": "D",
    "text": "AWS KMS"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m9q12",
  "module": 9,
  "stem": "A company wants to store database passwords securely and rotate them automatically. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS KMS"
   },
   {
    "key": "B",
    "text": "AWS Secrets Manager"
   },
   {
    "key": "C",
    "text": "AWS Certificate Manager"
   },
   {
    "key": "D",
    "text": "Amazon Cognito"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m10q1",
  "module": 10,
  "stem": "A company wants to be notified when the CPU utilisation of its EC2 instances exceeds 80%. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS CloudTrail"
   },
   {
    "key": "B",
    "text": "Amazon CloudWatch"
   },
   {
    "key": "C",
    "text": "AWS Config"
   },
   {
    "key": "D",
    "text": "AWS Trusted Advisor"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m10q2",
  "module": 10,
  "stem": "A security team needs to find out which user terminated a production EC2 instance yesterday. Which service provides this information?",
  "options": [
   {
    "key": "A",
    "text": "Amazon CloudWatch"
   },
   {
    "key": "B",
    "text": "AWS CloudTrail"
   },
   {
    "key": "C",
    "text": "AWS Health Dashboard"
   },
   {
    "key": "D",
    "text": "Amazon Inspector"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m10q3",
  "module": 10,
  "stem": "A company needs to track how the configuration of its resources changes over time and check whether resources comply with internal rules. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Config"
   },
   {
    "key": "B",
    "text": "AWS CloudTrail"
   },
   {
    "key": "C",
    "text": "Amazon GuardDuty"
   },
   {
    "key": "D",
    "text": "AWS Organizations"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m10q4",
  "module": 10,
  "stem": "Which service gives recommendations across cost optimisation, performance, security, fault tolerance and service limits?",
  "options": [
   {
    "key": "A",
    "text": "AWS Trusted Advisor"
   },
   {
    "key": "B",
    "text": "AWS Cost Explorer"
   },
   {
    "key": "C",
    "text": "AWS Systems Manager"
   },
   {
    "key": "D",
    "text": "Amazon Detective"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m10q5",
  "module": 10,
  "stem": "A company with 25 AWS accounts wants one bill and the ability to restrict which services each account can use. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Control Tower only"
   },
   {
    "key": "B",
    "text": "AWS Organizations"
   },
   {
    "key": "C",
    "text": "AWS IAM Identity Center"
   },
   {
    "key": "D",
    "text": "AWS Budgets"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m10q6",
  "module": 10,
  "stem": "Which statement about service control policies (SCPs) is correct?",
  "options": [
   {
    "key": "A",
    "text": "They grant permissions to IAM users"
   },
   {
    "key": "B",
    "text": "They set the maximum available permissions for accounts in an organisation"
   },
   {
    "key": "C",
    "text": "They only apply to the management account"
   },
   {
    "key": "D",
    "text": "They encrypt data in member accounts"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m10q7",
  "module": 10,
  "stem": "A company wants to set up a new, secure multi-account environment with pre-configured guardrails as quickly as possible. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Control Tower"
   },
   {
    "key": "B",
    "text": "AWS Service Catalog"
   },
   {
    "key": "C",
    "text": "AWS Config"
   },
   {
    "key": "D",
    "text": "AWS CloudFormation"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m10q8",
  "module": 10,
  "stem": "Where can a company see AWS service events and scheduled maintenance that will affect its own resources?",
  "options": [
   {
    "key": "A",
    "text": "AWS Health Dashboard"
   },
   {
    "key": "B",
    "text": "AWS Artifact"
   },
   {
    "key": "C",
    "text": "AWS Marketplace"
   },
   {
    "key": "D",
    "text": "Amazon CloudWatch Logs"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m10q9",
  "module": 10,
  "stem": "An operations team wants to patch hundreds of EC2 instances and on-premises servers from one place. Which service should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Systems Manager"
   },
   {
    "key": "B",
    "text": "AWS License Manager"
   },
   {
    "key": "C",
    "text": "AWS Trusted Advisor"
   },
   {
    "key": "D",
    "text": "Amazon Inspector"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m11q1",
  "module": 11,
  "stem": "A company wants to estimate the monthly cost of a new architecture before deploying anything. Which tool should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Cost Explorer"
   },
   {
    "key": "B",
    "text": "AWS Pricing Calculator"
   },
   {
    "key": "C",
    "text": "AWS Budgets"
   },
   {
    "key": "D",
    "text": "AWS Cost and Usage Report"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m11q2",
  "module": 11,
  "stem": "A finance manager wants an email alert when monthly AWS spend is forecast to exceed £500. Which service should be used?",
  "options": [
   {
    "key": "A",
    "text": "AWS Budgets"
   },
   {
    "key": "B",
    "text": "AWS Cost Explorer"
   },
   {
    "key": "C",
    "text": "AWS Trusted Advisor"
   },
   {
    "key": "D",
    "text": "Amazon CloudWatch Logs"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m11q3",
  "module": 11,
  "stem": "A company wants to view and analyse its AWS costs by service over the last 6 months. Which tool should it use?",
  "options": [
   {
    "key": "A",
    "text": "AWS Pricing Calculator"
   },
   {
    "key": "B",
    "text": "AWS Cost Explorer"
   },
   {
    "key": "C",
    "text": "AWS Artifact"
   },
   {
    "key": "D",
    "text": "AWS Marketplace"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m11q4",
  "module": 11,
  "stem": "Which feature lets a company combine billing for multiple accounts and benefit from volume pricing discounts?",
  "options": [
   {
    "key": "A",
    "text": "Consolidated billing in AWS Organizations"
   },
   {
    "key": "B",
    "text": "AWS Budgets"
   },
   {
    "key": "C",
    "text": "Cost allocation tags"
   },
   {
    "key": "D",
    "text": "AWS Control Tower"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m11q5",
  "module": 11,
  "stem": "Which data transfer is typically free of charge?",
  "options": [
   {
    "key": "A",
    "text": "Data transferred out of AWS to the internet"
   },
   {
    "key": "B",
    "text": "Data transferred into AWS from the internet"
   },
   {
    "key": "C",
    "text": "Data transferred between Regions"
   },
   {
    "key": "D",
    "text": "Data transferred through a NAT gateway"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m11q6",
  "module": 11,
  "stem": "Which AWS Support plan includes a designated Technical Account Manager?",
  "options": [
   {
    "key": "A",
    "text": "Basic"
   },
   {
    "key": "B",
    "text": "Developer"
   },
   {
    "key": "C",
    "text": "Business"
   },
   {
    "key": "D",
    "text": "Enterprise"
   }
  ],
  "answer": [
   "D"
  ]
 },
 {
  "id": "m11q7",
  "module": 11,
  "stem": "Which is included in AWS Basic Support at no extra cost?",
  "options": [
   {
    "key": "A",
    "text": "A designated Technical Account Manager"
   },
   {
    "key": "B",
    "text": "24/7 customer service for billing and account questions"
   },
   {
    "key": "C",
    "text": "Unlimited technical support cases with 1-hour response"
   },
   {
    "key": "D",
    "text": "Infrastructure Event Management"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m11q8",
  "module": 11,
  "stem": "A company wants to buy a pre-configured third-party firewall appliance that runs on AWS and pay through its AWS bill. Where should it look?",
  "options": [
   {
    "key": "A",
    "text": "AWS Marketplace"
   },
   {
    "key": "B",
    "text": "AWS Artifact"
   },
   {
    "key": "C",
    "text": "AWS Partner Network directory only"
   },
   {
    "key": "D",
    "text": "AWS Service Catalog"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m11q9",
  "module": 11,
  "stem": "Amazon S3 charges less per GB as the amount stored increases. Which pricing principle is this?",
  "options": [
   {
    "key": "A",
    "text": "Pay as you go"
   },
   {
    "key": "B",
    "text": "Pay less when you reserve"
   },
   {
    "key": "C",
    "text": "Pay less by using more"
   },
   {
    "key": "D",
    "text": "Free Tier"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m12q1",
  "module": 12,
  "stem": "Which AWS CAF perspective focuses on training staff, organisational change and building a cloud-ready culture?",
  "options": [
   {
    "key": "A",
    "text": "Business"
   },
   {
    "key": "B",
    "text": "People"
   },
   {
    "key": "C",
    "text": "Platform"
   },
   {
    "key": "D",
    "text": "Operations"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m12q2",
  "module": 12,
  "stem": "Which TWO AWS CAF perspectives focus on technical capabilities? (Choose two.)",
  "options": [
   {
    "key": "A",
    "text": "Platform"
   },
   {
    "key": "B",
    "text": "People"
   },
   {
    "key": "C",
    "text": "Operations"
   },
   {
    "key": "D",
    "text": "Business"
   },
   {
    "key": "E",
    "text": "Governance"
   }
  ],
  "answer": [
   "A",
   "C"
  ]
 },
 {
  "id": "m12q3",
  "module": 12,
  "stem": "A company wants to move its application servers to Amazon EC2 quickly without making any changes. Which migration strategy is this?",
  "options": [
   {
    "key": "A",
    "text": "Refactor"
   },
   {
    "key": "B",
    "text": "Replatform"
   },
   {
    "key": "C",
    "text": "Rehost"
   },
   {
    "key": "D",
    "text": "Repurchase"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m12q4",
  "module": 12,
  "stem": "A company moves its self-managed MySQL database to Amazon RDS without changing its application code. Which strategy is this?",
  "options": [
   {
    "key": "A",
    "text": "Replatform"
   },
   {
    "key": "B",
    "text": "Rehost"
   },
   {
    "key": "C",
    "text": "Retain"
   },
   {
    "key": "D",
    "text": "Refactor"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m12q5",
  "module": 12,
  "stem": "A company decides to stop using its on-premises email server and switch to a SaaS email product. Which strategy is this?",
  "options": [
   {
    "key": "A",
    "text": "Relocate"
   },
   {
    "key": "B",
    "text": "Retire"
   },
   {
    "key": "C",
    "text": "Repurchase"
   },
   {
    "key": "D",
    "text": "Rehost"
   }
  ],
  "answer": [
   "C"
  ]
 },
 {
  "id": "m12q6",
  "module": 12,
  "stem": "A company rewrites its monolithic application as serverless microservices to gain agility. Which strategy is this?",
  "options": [
   {
    "key": "A",
    "text": "Replatform"
   },
   {
    "key": "B",
    "text": "Refactor/re-architect"
   },
   {
    "key": "C",
    "text": "Rehost"
   },
   {
    "key": "D",
    "text": "Retain"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m12q7",
  "module": 12,
  "stem": "A company needs to move 80 TB of data to AWS but has a slow internet connection. Which service is most suitable?",
  "options": [
   {
    "key": "A",
    "text": "AWS DataSync"
   },
   {
    "key": "B",
    "text": "AWS Snowball Edge"
   },
   {
    "key": "C",
    "text": "AWS Transfer Family"
   },
   {
    "key": "D",
    "text": "Amazon CloudFront"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m12q8",
  "module": 12,
  "stem": "Which service automatically replicates on-premises servers to AWS for a lift-and-shift migration?",
  "options": [
   {
    "key": "A",
    "text": "AWS Application Migration Service"
   },
   {
    "key": "B",
    "text": "AWS Database Migration Service"
   },
   {
    "key": "C",
    "text": "AWS Backup"
   },
   {
    "key": "D",
    "text": "AWS Storage Gateway"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m12q9",
  "module": 12,
  "stem": "During migration planning a company finds an application that nobody uses any more. Which strategy should it apply?",
  "options": [
   {
    "key": "A",
    "text": "Retain"
   },
   {
    "key": "B",
    "text": "Retire"
   },
   {
    "key": "C",
    "text": "Relocate"
   },
   {
    "key": "D",
    "text": "Rehost"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q1",
  "module": 13,
  "stem": "Which Well-Architected pillar focuses on a workload's ability to recover from failures and meet demand?",
  "options": [
   {
    "key": "A",
    "text": "Performance efficiency"
   },
   {
    "key": "B",
    "text": "Reliability"
   },
   {
    "key": "C",
    "text": "Operational excellence"
   },
   {
    "key": "D",
    "text": "Security"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q2",
  "module": 13,
  "stem": "Which pillar focuses on minimising the environmental impact of running cloud workloads?",
  "options": [
   {
    "key": "A",
    "text": "Cost optimisation"
   },
   {
    "key": "B",
    "text": "Sustainability"
   },
   {
    "key": "C",
    "text": "Performance efficiency"
   },
   {
    "key": "D",
    "text": "Reliability"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q3",
  "module": 13,
  "stem": "Right-sizing instances and buying Savings Plans for steady workloads are practices of which pillar?",
  "options": [
   {
    "key": "A",
    "text": "Cost optimisation"
   },
   {
    "key": "B",
    "text": "Security"
   },
   {
    "key": "C",
    "text": "Reliability"
   },
   {
    "key": "D",
    "text": "Operational excellence"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m13q4",
  "module": 13,
  "stem": "Performing operations as code and making frequent, small, reversible changes are design principles of which pillar?",
  "options": [
   {
    "key": "A",
    "text": "Reliability"
   },
   {
    "key": "B",
    "text": "Operational excellence"
   },
   {
    "key": "C",
    "text": "Performance efficiency"
   },
   {
    "key": "D",
    "text": "Sustainability"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q5",
  "module": 13,
  "stem": "Which service helps a company review its workloads against AWS architectural best practices?",
  "options": [
   {
    "key": "A",
    "text": "AWS Trusted Advisor"
   },
   {
    "key": "B",
    "text": "AWS Well-Architected Tool"
   },
   {
    "key": "C",
    "text": "AWS Config"
   },
   {
    "key": "D",
    "text": "AWS Artifact"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q6",
  "module": 13,
  "stem": "Using serverless architectures and \"going global in minutes\" are design principles of which pillar?",
  "options": [
   {
    "key": "A",
    "text": "Performance efficiency"
   },
   {
    "key": "B",
    "text": "Cost optimisation"
   },
   {
    "key": "C",
    "text": "Security"
   },
   {
    "key": "D",
    "text": "Reliability"
   }
  ],
  "answer": [
   "A"
  ]
 },
 {
  "id": "m13q7",
  "module": 13,
  "stem": "Enabling traceability and applying security at all layers belong to which pillar?",
  "options": [
   {
    "key": "A",
    "text": "Operational excellence"
   },
   {
    "key": "B",
    "text": "Security"
   },
   {
    "key": "C",
    "text": "Reliability"
   },
   {
    "key": "D",
    "text": "Sustainability"
   }
  ],
  "answer": [
   "B"
  ]
 },
 {
  "id": "m13q8",
  "module": 13,
  "stem": "Which disaster recovery strategy has the lowest cost but the longest recovery time?",
  "options": [
   {
    "key": "A",
    "text": "Multi-site active/active"
   },
   {
    "key": "B",
    "text": "Warm standby"
   },
   {
    "key": "C",
    "text": "Pilot light"
   },
   {
    "key": "D",
    "text": "Backup and restore"
   }
  ],
  "answer": [
   "D"
  ]
 },
 {
  "id": "m13q9",
  "module": 13,
  "stem": "How many pillars does the AWS Well-Architected Framework have?",
  "options": [
   {
    "key": "A",
    "text": "Four"
   },
   {
    "key": "B",
    "text": "Five"
   },
   {
    "key": "C",
    "text": "Six"
   },
   {
    "key": "D",
    "text": "Seven"
   }
  ],
  "answer": [
   "C"
  ]
 }
];
