---
title: Depth (Y) — Model Architectures & Multi-Tier Ensemble
---

# Model Architectures & Multi-Tier Ensemble (v1.0)

> **Publication Reference**: Modaresi Rad, A., et al. (2024). *Enhancing River Channel Dimension and Bathymetry Estimates Across Continental Scale Using Machine Learning and Functional Hydraulic Geometry*. **Journal of Geophysical Research: Machine Learning and Computation**, 1(3), e2024JH000173.

---

## Overview

Predicting river channel depth across continental hydro-climatic gradients requires capturing highly non-linear interactions among fluvial geology, valley topography, soil mechanical properties, and upstream flow regime. In version **v1.0**, channel depth is modeled through two complementary mathematical formulations implemented across a **three-tier stacked ensemble architecture**.

```mermaid
flowchart TD
    subgraph RAW ["1. Continental Raw Attributes (>400 Features)"]
        direction LR
        F1["Hydrofabric & Topology"]
        F2["Soil Geomechanics"]
        F3["DEM Terrain & Slope"]
        F4["StreamCat Catchment"]
        F5["Land Cover & LAI"]
        F6["Climate & Runoff"]
        F7["NWM Flow Duration"]
    end

    subgraph REDUCE ["2. Dimensionality Reduction & Feature Selection"]
        RFE["Recursive Feature Elimination (RFE)"]
        AE["Denoising AutoEncoder (Latent Embeddings)"]
        TOP60["<b>~60 Salient Predictors</b>"]
        RFE --> TOP60
        AE --> TOP60
    end

    subgraph SELECTION ["3. 50 Candidate ML Screening & Hyperparameter Tuning"]
        CAND["Screen 50 Default Algorithms<br/><i>(GBDT, RF, ExtraTrees, SVR, DNN, LightGBM, CatBoost)</i>"]
        TOP_MODELS["Select Top 6–8 Models for Bayesian Hyperparameter Optimization"]
        CAND --> TOP_MODELS
    end

    subgraph ENSEMBLE ["4. Multi-Tier Ensemble Modeling"]
        direction TB
        subgraph T1 ["Tier 1: Best Single Model"]
            M_BEST["Tuned XGBoost / CatBoost"]
        end
        subgraph T2 ["Tier 2: Voting Ensemble"]
            M_VOTE["Unweighted / Weighted Mean<br/>&ycirc; = &frac18; &Sigma; &ycirc;<sub>i</sub>"]
        end
        subgraph T3 ["Tier 3: Meta-Learner (Stacked Stacking)"]
            M_META["Level-2 Regressor<br/>Learns Model Error Correlations across Physiographic Space"]
        end
    end

    subgraph OUTPUT ["5. Channel Depth Outputs"]
        direction LR
        P_FHG["FHG Exponent <i>f</i> & Coeff <i>c</i><br/><i>Y(Q) = c &middot; Q<sup>f</sup></i>"]
        P_DIR["Direct Depth Prediction<br/><i>Y<sub>bf</sub></i>, <i>Y<sub>10</sub></i>, <i>Y<sub>100</sub></i>"]
    end

    RAW ==> REDUCE ==> SELECTION ==> ENSEMBLE ==> OUTPUT

    class ENSEMBLE highlight-blue;
    class T3 highlight-blue;
    class OUTPUT highlight-teal;
```

---

## Two Complementary Modeling Formulations

To serve both continuous hydrodynamic routing and discrete flood hazard mapping, the v1.0 pipeline implements two depth estimation formulations:

### 1. Functional Hydraulic Geometry (FHG) Parameterization

Predicts the continuous At-A-Station power-law parameters ($f$ and $c$) as functions of static reach and catchment attributes $\mathbf{X}$:

$$
f = \mathcal{M}_f(\mathbf{X}), \quad c = \mathcal{M}_c(\mathbf{X})
$$

Given any simulated or observed discharge hydrograph $Q(t)$, in-channel mean depth $Y(t)$ is computed analytically:

$$
Y(t) = c \cdot [Q(t)]^f
$$

* **Advantages**: Seamless integration into unsteady 1D/2D hydraulic models (e.g., HEC-RAS rating curves, NOAA NextGen FIM); continuous depth calculation at baseflow, median flow, bankfull, and extreme flood stages.
* **Continuity Enforcement**: Joint optimization maintains continuity constraints with width ($W = a \cdot Q^b$) and velocity ($V = k \cdot Q^m$), such that $b + f + m = 1.0$ and $a \cdot c \cdot k = 1.0$.

### 2. Direct Depth Prediction

Predicts discrete water depths ($Y$) directly for defined flow quantiles or bankfull discharge ($Q_{bf}$):

$$
Y_{bf} = \mathcal{M}_Y(\mathbf{X}, Q_{bf})
$$

* **Advantages**: Direct objective minimization on observed depth measurements; independent validation of the power-law parameterization.

---

## Predictor Space & Dimensionality Reduction

The initial feature repository comprises **>400 environmental variables** aggregated from national geospatial hydro-environmental datasets:

| Domain | Key Features | Physical Mechanism for Depth |
| :--- | :--- | :--- |
| **Hydrofabric & Topology** | Strahler stream order, arbolate sum, path length, upstream drainage area ($A_{\text{up}}$) | Governs cumulative volume conveyance and downstream hydraulic scale |
| **Soil & Geotechnical** | % clay, % silt, % sand, $K_{\text{sat}}$ (saturated hydraulic conductivity), $\theta_s$ (water capacity), depth to bedrock | High clay content increases bank cohesion, forcing vertical incision ($f \uparrow$) over widening |
| **DEM & Topography** | Channel slope ($S$), valley slope, elevation, relief diversity, NED physiographic diversity | High slope increases flow velocity and stream power ($\Omega = \gamma Q S$), altering incision potential |
| **StreamCat Attributes** | Baseflow Index (`BFI`), % impervious, road density, % urban/forest cover | High BFI creates sustained baseflows with stable equilibrium channel depths |
| **Land Surface / Vegetation** | Leaf Area Index (`LAI`), NDVI, actual evapotranspiration (`AET`) | Root density stabilizes banks; vegetation regulates catchment runoff ratios |
| **Climate & Hydrology** | Mean annual precipitation (`MAP`), aridity index, precipitation seasonality, temperature | Drives long-term mean annual discharge and flood peak magnitudes |
| **NWM Flow Statistics** | Flow duration quantiles ($Q_{10}, Q_{50}, Q_{90}$), bankfull discharge ($Q_{bf}$), return period flows ($Q_{2}, Q_{10}, Q_{100}$) | Sets the energetic discharge spectrum governing channel geometry formation |

### Dimensionality Reduction Pipeline

To avoid collinearity, mitigate the curse of dimensionality, and eliminate spurious correlations, dimensionality reduction is performed in two steps:

1. **Recursive Feature Elimination (RFE)**: Iteratively trains gradient boosted models, dropping the single least influential predictor until cross-validation performance peaks.
2. **Denoising AutoEncoder (AE)**: High-dimensional correlated subsets are passed through a symmetric bottleneck neural network to construct low-dimensional latent embeddings capturing non-linear feature co-dependencies:

```
Input Features (X ∈ ℝ⁴⁰⁰)
       │
   [Dense 256 + ReLU + BatchNorm]
       │
   [Dense 128 + Dropout(0.2)]
       │
   [Latent Bottleneck: 60 Dimensions]  <── Salient Predictor Embeddings
       │
   [Dense 128 + ReLU]
       │
   [Dense 256 + Reconstruction Loss]
```

This reduces the feature space to **~60 orthogonal, physically informative features**.

---

## Multi-Tier Modeling Strategies

Rather than relying on a single learning algorithm, the framework implements a three-tier hierarchical architecture:

```mermaid
classDiagram
    class Tier1_BestModel {
        +Algorithm: Tuned XGBoost / CatBoost
        +Type: Individual Gradient Boosted Tree
        +Optimization: Bayesian Hyperparameter Tuning
        +Characteristics: High accuracy on dominant geomorphic regimes
    }
    class Tier2_VotingEnsemble {
        +Algorithm: Averaging / Weighted Blending
        +BaseModels: Top 6-8 ML algorithms
        +Formula: ŷ = 1/M ∑ ŷᵢ
        +Characteristics: Reduces individual model variance and outliers
    }
    class Tier3_MetaLearner {
        +Algorithm: Stacked Generalization (Level-2 Regressor)
        +Inputs: Out-of-fold predictions from Base Models
        +Conditioning: Catchment physiography & climate
        +Characteristics: Learns model strengths & error correlations
    }
    Tier1_BestModel <|-- Tier2_VotingEnsemble
    Tier2_VotingEnsemble <|-- Tier3_MetaLearner
```

### Tier 1: Best Individual ML Model

* Evaluates **50 candidate regression algorithms** (including Random Forest, Extra Trees, XGBoost, LightGBM, CatBoost, Support Vector Machines, Multi-Layer Perceptrons, Ridge/ElasticNet) with default parameters to establish robust inductive biases.
* Selects the single highest-performing algorithm—typically **XGBoost (Extreme Gradient Boosting)** or **CatBoost**—and performs Bayesian hyperparameter optimization over tree depth, learning rate, subsample ratio, and regularizers ($\lambda, \alpha$).

### Tier 2: Voting Ensemble

Combines the out-of-fold predictions of the top 6–8 tuned models:

$$
\hat{Y}_{\text{voting}} = \sum_{m=1}^{M} w_m \hat{Y}_m, \quad \text{where } \sum_{m=1}^M w_m = 1.0
$$

Averaging across diverse model families (tree ensembles, linear regularizers, neural nets) dampens idiosyncratic variance and suppresses extreme outlier errors.

### Tier 3: Meta-Learner (Stacked Generalization)

The **Meta-Learner** operates one level above standard ML models by learning from the *predictions of other models* rather than raw historical attributes alone:

$$
\hat{Y}_{\text{meta}} = \mathcal{F}_{\text{meta}}\left(\hat{Y}_1, \hat{Y}_2, \dots, \hat{Y}_M; \mathbf{Z}_{\text{physio}}\right)
$$

* **Mechanism**: During training, $K$-fold cross-validation generates out-of-fold predictions for each base model. The level-2 meta-learner is trained on these held-out predictions alongside key physiographic indicators ($\mathbf{Z}_{\text{physio}}$).
* **Physical Synergy**: The meta-learner discovers regional regimes where specific base models excel. For example:
    * Tree ensembles accurately capture step-change geomorphic thresholds in steep, faulted mountain reaches.
    * Neural network representations capture smooth, continuous power-law growth in expansive low-gradient alluvial basins.
* **Result**: The Meta-Learner dynamically weights the base models across physiographic space, achieving lower residual variance and higher cumulative skill than any single model or unweighted ensemble.

---

## Log-Space Transformation & Bias Correction

Channel depth $Y$ spans multiple orders of magnitude across headwaters ($Y \sim 0.2\,\text{m}$) and major continental rivers ($Y > 15\,\text{m}$). Training directly in arithmetic space leads to severe heteroscedasticity and large-river bias.

### 1. Logarithmic Target Transformation

Target variables ($Y$, $f$, $c$) are transformed into natural log space:

$$
y_{\log} = \ln(Y + \epsilon)
$$

### 2. Analytical Smearing / Bias Correction

Because $\mathbb{E}[\exp(X)] \neq \exp(\mathbb{E}[X])$, direct exponentiation of log-space predictions underestimates arithmetic means. Predictions are corrected using the analytical variance smearing factor:

$$
\hat{Y} = \exp\left(\hat{y}_{\log} + \frac{\sigma^2_{\text{val}}}{2}\right) - \epsilon
$$

where $\sigma^2_{\text{val}}$ is the residual mean squared error evaluated on the validation fold.

---

## Overfitting Prevention & Cross-Validation

To ensure genuine out-of-sample generalization across unseen hydrographic basins:

```
Continental Dataset (3,500+ Gauged Sites / HYDRoSWOT ADCP)
┌───────────────────────────────────────────────────────────────┐
│                    K-Fold Spatial Split                       │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│ Fold 1 (20%) │ Fold 2 (20%) │ Fold 3 (20%) │ ... Fold 5 (20%) │
└──────────────┴──────────────┴──────────────┴──────────────────┘
       │
       ├── Training Set (80%): Multi-Seed Gradient Boosting + Early Stopping
       ├── Validation Set: Evaluates patience threshold (100 rounds)
       └── Out-of-Bag Test Set: Final blind evaluation (NNSE, KGE, RMSE)
```

1. **Spatial & River Network Splitting**: Holdout folds are clustered by hydrologic unit codes (HUC-8/HUC-4) to prevent spatial autocorrelation leakage between adjacent stream gages.
2. **Early Stopping Regularization**: Training terminates when validation loss fails to decrease for 100 consecutive iterations.
3. **Dropout & Tree Subsampling**: Neural models utilize feature dropout ($p = 0.2$), while tree models subsample features (`colsample_bytree = 0.8`) and data instances (`subsample = 0.8`) at each split.

---

## Section Navigation

- [Depth v1.0 Overview](index.md) — Problem statement, FHG continuity formulation, and summary.
- [Model Skill & Evaluation](skill.md) — Continental USGS validation, NNSE CDFs, max flow diagnostics, and literature benchmarking.
- [Explainable AI (XAI)](xai.md) — Global SHAP attributions, feature interaction analyses, and physical mechanisms.
