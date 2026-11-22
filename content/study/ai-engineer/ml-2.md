**PyTorch** is the main framework for deep learning research and most open models. Training one small network yourself makes the theory behind LLMs concrete: tensors, layers, loss, gradients, optimisers.

## The pieces

| Concept | In PyTorch |
|---|---|
| **Tensor** | `torch.tensor(...)`: an n-dimensional array that can live on a GPU and track gradients |
| **Model** | A class extending `nn.Module` with layers and a `forward` method |
| **Loss** | How wrong the predictions are (`nn.CrossEntropyLoss`, `nn.MSELoss`) |
| **Optimiser** | Updates weights to reduce loss (`torch.optim.AdamW`) |
| **Autograd** | `loss.backward()` computes gradients for every weight automatically |
| **DataLoader** | Feeds data in shuffled mini-batches |

## The training loop

Every PyTorch training loop is these five lines, repeated:

```python
pred = model(x)            # 1. forward pass
loss = loss_fn(pred, y)    # 2. how wrong?
optimizer.zero_grad()      # 3. clear old gradients
loss.backward()            # 4. backpropagation: compute gradients
optimizer.step()           # 5. nudge weights downhill
```

## A complete example: classify handwritten digits (MNIST)

```python
# pip install torch torchvision
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

device = "cuda" if torch.cuda.is_available() else "cpu"
tf = transforms.ToTensor()
train = DataLoader(datasets.MNIST("data", train=True, download=True, transform=tf), batch_size=64, shuffle=True)
test = DataLoader(datasets.MNIST("data", train=False, download=True, transform=tf), batch_size=256)

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Flatten(),                 # 28×28 image → 784 numbers
            nn.Linear(784, 128), nn.ReLU(),
            nn.Linear(128, 10),           # 10 scores, one per digit
        )
    def forward(self, x):
        return self.layers(x)

model = Net().to(device)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)

for epoch in range(3):
    model.train()
    for x, y in train:
        x, y = x.to(device), y.to(device)
        loss = loss_fn(model(x), y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    model.eval()
    correct = 0
    with torch.no_grad():                 # no gradients needed for evaluation
        for x, y in test:
            correct += (model(x.to(device)).argmax(1) == y.to(device)).sum().item()
    print(f"epoch {epoch}: test accuracy {correct / len(test.dataset):.3f}")
```

This reaches around 97% accuracy in a few minutes on a laptop CPU.

## How this connects to LLMs

An LLM is the same recipe at enormous scale:

| MNIST net | LLM |
|---|---|
| Input: 784 pixels | Input: token embeddings |
| 2 linear layers | Dozens of transformer layers (attention + feed-forward) |
| Output: 10 class scores | Output: a score for every token in the vocabulary |
| Loss: cross-entropy on the digit | Loss: cross-entropy on the next token |
| ~100K parameters, 60K images | Hundreds of billions of parameters, trillions of tokens |

Same forward pass, same loss, same backpropagation, same optimiser family.

## Things to try

- Add a hidden layer, or change 128 to 512; does accuracy change?
- Replace the linear layers with a small **CNN** (`nn.Conv2d`); it should beat 98%.
- Plot the training loss per batch to see learning happen.
- Deliberately overfit: train on 500 images for 50 epochs and compare train vs test accuracy.

## Check yourself

1. What does `loss.backward()` do?
2. Why call `optimizer.zero_grad()` every step?
3. What's the training objective of an LLM, in the same terms as this example?

### Answers

1. It computes the gradient of the loss with respect to every trainable weight (backpropagation).
2. PyTorch adds gradients up by default; without clearing them, each step would use gradients accumulated from earlier batches.
3. Cross-entropy loss on predicting the next token, minimised with backpropagation and an optimiser like AdamW.
