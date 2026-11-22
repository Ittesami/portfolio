Before reaching for an LLM, a good engineer asks: **would a classic ML model do this cheaper, faster and more reliably?** For tabular data and simple classification, it often would. **scikit-learn** is the standard library for this.

## The ML workflow

```
data → split (train / test) → features → train model → evaluate on test → tune → deploy
```

## A complete example: predict whether you'll hit your protein target

Imagine a table from your Daily food log: one row per day.

```python
# pip install scikit-learn pandas
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("days.csv")      # columns: weekday, gym_day, work_day, meals_logged, kcal_by_2pm, hit_protein
X = df.drop(columns="hit_protein")
y = df["hit_protein"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

prep = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["weekday"]),
    ("num", StandardScaler(), ["meals_logged", "kcal_by_2pm"]),
], remainder="passthrough")       # gym_day, work_day are already 0/1

for model in [LogisticRegression(max_iter=1000), RandomForestClassifier(n_estimators=200, random_state=42)]:
    pipe = Pipeline([("prep", prep), ("model", model)])
    pipe.fit(X_train, y_train)
    print(type(model).__name__)
    print(classification_report(y_test, pipe.predict(X_test)))
```

## Key ideas

**Train/test split**: evaluate on data the model never saw, otherwise you measure memorisation. (Same idea as your eval dev/test split.)

**Baselines first**: always compare against something dumb, e.g. "always predict the most common class". If your model can't beat that, it's learned nothing.

```python
from sklearn.dummy import DummyClassifier
DummyClassifier(strategy="most_frequent").fit(X_train, y_train).score(X_test, y_test)
```

**Pipelines**: bundle preprocessing and the model so the same steps run in training and prediction, with no leakage from test data into scaling.

**Metrics** (classification):

| Metric | Question it answers |
|---|---|
| Accuracy | What fraction were right? (Misleading when classes are imbalanced) |
| Precision | Of those predicted positive, how many really were? |
| Recall | Of the real positives, how many did we catch? |
| F1 | Balance of precision and recall |

**Cross-validation** (`cross_val_score`) gives a more reliable estimate on small datasets by training and testing on several splits.

## Classic ML vs LLMs

| | Classic ML (scikit-learn) | LLM |
|---|---|---|
| Data | Structured/tabular, labelled | Text, images, messy input |
| Needs | Hundreds+ labelled examples | A prompt, few examples |
| Cost per prediction | Almost zero, microseconds | Tokens, hundreds of ms+ |
| Explainability | Often good (coefficients, feature importance) | Hard |
| Flexibility | One task | Many tasks |

A great combination: **use an LLM to label data**, then **train a small classic model** on those labels for cheap, fast predictions at scale.

## Check yourself

1. Why evaluate on a separate test set?
2. 95% of days you hit your target. A model gets 95% accuracy. Is it good?
3. When would you choose scikit-learn over an LLM?

### Answers

1. To measure how well the model generalises to new data rather than how well it memorised the training data.
2. Not necessarily. Always predicting "hit" gets 95%; compare against that baseline and look at precision/recall for the minority class.
3. For structured/tabular data with enough labelled examples, when you need very cheap, fast, consistent or explainable predictions.
