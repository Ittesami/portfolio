This guide covers **all six hands-on tasks** in this module, in order. Doing them takes about an hour and makes the services far easier to remember in the exam. Tick each task off on the course page as you finish it.

> **Cost safety first.** Use the **Free plan**, follow the steps exactly, and **delete what you create** at the end. On the Free plan you can't be charged, but it's a good habit for when you're on a paid account.

## 1. Create an AWS account on the Free plan

1. Go to aws.amazon.com and choose **Create an AWS account**.
2. Enter your email and an account name. This email becomes the **root user**.
3. When asked, choose the **Free plan** (you get $100 in credits, and up to $100 more for onboarding tasks).
4. Verify your identity and phone number.
5. Sign in to the **AWS Management Console** as the root user.

**What you learned:** the root user, and the Free plan (Module 11).

## 2. Turn on MFA for the root user

1. Top-right menu → **Security credentials**.
2. Under **Multi-factor authentication (MFA)**, choose **Assign MFA device**.
3. Pick **Authenticator app**, scan the QR code with an app like Google Authenticator or Microsoft Authenticator, and enter two codes.

**What you learned:** MFA and root-user best practice (Module 9).

## 3. Create an IAM user (and stop using root)

The simplest modern way is **IAM Identity Center**, but for practice an IAM user is fine:

1. Open **IAM** → **Users** → **Create user**.
2. Name it (e.g. `ittehad-admin`) and allow **console access**.
3. **Permissions:** create a group called `Admins`, attach the `AdministratorAccess` policy to the **group**, and add the user to it.
4. Sign out, then sign in with the new user's sign-in URL. Use this user from now on.

**What you learned:** users, groups, policies, and attaching permissions to groups (Module 9). (In real work you'd give narrower permissions: least privilege.)

## 4. Launch a t3.micro EC2 instance, connect, then terminate it

1. Choose a Region near you (e.g. **Europe (London) eu-west-2**) in the top bar.
2. Open **EC2** → **Launch instance**.
3. Name it, pick the **Amazon Linux** AMI, and choose **t3.micro** (or t2.micro).
4. Key pair: choose **proceed without a key pair** (you'll connect through the browser).
5. Network settings: leave the default VPC and keep **Allow SSH traffic** ticked. Notice you're creating a **security group**. The browser connection in the next step comes from AWS's own addresses, not your IP, so leave the source as **Anywhere** for this short test. The console warns you about it, which is a good habit to notice; you'll terminate the instance in a few minutes.
6. **Launch**, wait until it's **Running**, then select it → **Connect** → **EC2 Instance Connect** → **Connect**. You now have a terminal on a server in London.
7. Try `uname -a` and `curl http://checkip.amazonaws.com`.
8. **Instance state → Terminate instance.**

**What you learned:** Regions, AMIs, instance types, security groups, the default VPC (Modules 2, 4, 5).

## 5. Create an S3 bucket and upload a file

1. Open **S3** → **Create bucket**.
2. Give it a **globally unique** name (e.g. `ittehad-practice-2026-11`), in your Region.
3. Leave **Block all public access** on (buckets are private by default).
4. Open the bucket → **Upload** a small file.
5. Click the file and look at its properties: storage class (**Standard**), encryption (on by default).
6. Optional: turn on **Versioning** in the bucket's properties, upload the file again, and see both versions.
7. When done: **Empty** the bucket, then **Delete** it.

**What you learned:** buckets, objects, global names, storage classes, encryption, versioning (Module 6).

## 6. Set an AWS Budget alert

1. Open **Billing and Cost Management** → **Budgets** → **Create budget**.
2. Choose the **Zero spend budget** template (or a monthly budget of, say, $5).
3. Enter your email for alerts and create it.

**What you learned:** AWS Budgets, alerts on future spend (Module 11). On the Free plan, this also counts towards your onboarding credits.

## Clean-up checklist

- EC2 instance **terminated** (check there are no running instances in any Region you used).
- S3 bucket **emptied and deleted**.
- Budget alert **kept** (it's free and useful).
- Signed in as the IAM user, root user locked away with MFA.

## Check yourself

1. Which identity should you use for everyday work after creating the account?
2. Why did the EC2 launch create a security group?
3. Why did your bucket name have to be unique across all of AWS?

### Answers

1. An IAM user (or IAM Identity Center user), not the root user.
2. Every instance gets a firewall at the instance level. The security group allowed inbound SSH so you could connect; everything else inbound stayed blocked by default.
3. S3 bucket names are globally unique, because they're used in web addresses.
