---
title: Depth (Y) — Explainable AI (XAI) & Physical Interpretability
---

# Explainable AI (XAI) & Physical Interpretability (v1.0)

> **Publication Reference**: Modaresi Rad, A., et al. (2024). *Enhancing River Channel Dimension and Bathymetry Estimates Across Continental Scale Using Machine Learning and Functional Hydraulic Geometry*. **Journal of Geophysical Research: Machine Learning and Computation**, 1(3), e2024JH000173.

---

## The Role of Explainable AI in River Geomorphology

In continental-scale hydrologic and hydrodynamic modeling, high predictive accuracy is necessary but insufficient on its own. To be trusted in regulatory flood risk mapping (FEMA) and operational flood forecasting (NOAA-OWP National Water Model), machine learning models must demonstrate that their predictions conform to established **physical laws of open-channel hydraulics and fluvial geomorphology**.

We employ **SHAP (SHapley Additive exPlanations)**—a cooperative game-theoretic framework developed by Lundberg & Lee (2017)—to compute exact, additive feature attributions for channel depth ($Y$) and Functional Hydraulic Geometry (FHG) parameters ($f$ and $c$).

$$
f(\mathbf{x}) = \phi_0 + \sum_{j=1}^{M} \phi_j(\mathbf{x})
$$

where $\phi_0$ is the base expected model prediction across the continental dataset, and $\phi_j(\mathbf{x})$ is the Shapley value quantifying the positive or negative contribution of predictor $j$ for reach $\mathbf{x}$.

---

## Global Feature Importance for Depth Exponent ($f$) and Coefficient ($c$)

The SHAP summary beeswarm plot below ranks the top hydro-environmental predictors by mean absolute Shapley value ($|\phi_j|$) and illustrates their directional influence across thousands of continental river reaches:

![SHAP Global Feature Importance and Directional Impact for Channel Depth Parameters](../../assets/images/v1.0/y/Fig4_y.png){ loading=lazy }

### Top Physical Predictors Ranked by Importance

| Rank | Feature | Description | Dominant Hydraulic Mechanism |
| :---: | :--- | :--- | :--- |
| **1** | **Drainage Area / Arbolate Sum** | Cumulative upstream catchment area ($A_{\text{up}}$) and digitized flowline length | Sets the baseline volumetric flow scale ($Q$), exerting dominant positive control on depth coefficient $c$ |
| **2** | **Channel Slope ($S$)** | Longitudinal bed gradient ($\text{m/m}$) | Governs gravitational driving potential and flow velocity; negatively correlated with depth exponent $f$ |
| **3** | **Mean Annual Precipitation (MAP)** | Long-term climatological rainfall ($\text{mm/yr}$) | Controls mean annual runoff depth and effective formative discharge magnitude |
| **4** | **Soil Clay % & Cohesion** | Catchment and riparian soil fine fraction | Increases bank cohesion and critical shear stress ($\tau_c$), forcing vertical deepening ($f \uparrow$) over widening |
| **5** | **Baseflow Index (BFI)** | Ratio of baseflow to total streamflow volume | Sustains perennial low-flow thalwegs, producing deeper, more defined low-flow channel geometries |
| **6** | **Hydraulic Conductivity ($K_{\text{sat}}$)** | Saturated soil permeability ($\text{cm/hr}$) | Regulates subsurface vs. surface runoff partitioning, modulating hydrograph peakedness |
| **7** | **Flow Quantiles ($Q_{50}, Q_{90}$)** | Median and low-flow discharge percentiles | Defines the baseflow conveyance threshold required to maintain cross-sectional depth |

---

## Physical Interpretation of Directional SHAP Attributions

```
Directional Effect of Key Predictors on Depth Parameters:
┌────────────────────────────────────────────────────────────────────────┐
│ High Predictor Value (Red Dots)    ──► Positive (+) or Negative (-)    │
├────────────────────────────────────────────────────────────────────────┤
│ • Drainage Area (A_up)    [HIGH]   ──► Increases Depth Coefficient c  │
│ • Channel Slope (S)       [HIGH]   ──► Decreases Depth Exponent f     │
│ • Soil Clay %             [HIGH]   ──► Increases Exponent f & Depth Y │
│ • Saturated Ksat          [HIGH]   ──► Decreases Exponent f           │
│ • Baseflow Index (BFI)    [HIGH]   ──► Increases Depth Coefficient c  │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Channel Slope ($S$) vs. Depth Exponent ($f$)

* **Observation**: High channel slopes (red points) exhibit strong negative SHAP values for the depth exponent $f$.
* **Hydraulic Mechanism**: According to Manning's equation ($V = \frac{1}{n} R^{2/3} S^{1/2}$), steeper channels generate higher flow velocities for a given discharge. As flow rises in steep mountain reaches, the velocity exponent ($m$) absorbs a larger fraction of continuity ($b + f + m = 1.0$). Consequently, stage rises more slowly per unit increase in discharge, yielding a lower depth exponent $f$.

### 2. Soil Clay Content & Bank Cohesion

* **Observation**: High soil clay percentages strongly promote positive SHAP values for both $f$ and $c$.
* **Geomorphic Mechanism**: Bank stability in alluvial channels is governed by the critical shear stress of bank materials:

$$\tau_c = \zeta \cdot c_{\text{soil}} + (\rho_s - \rho) g D \tan \phi$$

Cohesive clay-rich banks resist lateral hydraulic erosion and bank collapse. When discharge increases, the flow is constrained from widening (lower width exponent $b$) and is forced to scour vertically into the bed, resulting in a higher depth exponent $f$ and deeper, narrower channel profiles (lower width-to-depth ratio $W/Y$).

### 3. Baseflow Index (BFI) & Flow Stability

* **Observation**: Catchments with high Baseflow Index (BFI > 0.60) exhibit consistently elevated depth coefficients $c$.
* **Hydrologic Mechanism**: High-BFI channels experience sustained groundwater discharge throughout the year rather than intermittent, flashy flood pulses. This continuous baseflow maintains a well-scoured, permanent in-channel thalweg, preventing channel bed aggradation and increasing base depth at unit flow.

---

## Non-Linear Feature Interactions & 2D Dependency Analysis

Channel morphology is governed by complex non-linear couplings between hydraulic driving forces and boundary resistive forces. We performed **SHAP interaction value analysis** ($\Phi_{i, j}$) to decouple the main effect of each variable from its second-order interaction terms:

![SHAP 2D Interaction and Dependence Analyses for Channel Depth Parameters](../../assets/images/v1.0/y/Fig6_y.png){ loading=lazy }

### Key 2D Interaction Insights

#### 1. Slope–Drainage Area Coupling (Total Stream Power)

The interaction between longitudinal slope ($S$) and drainage area ($A_{\text{up}}$) mirrors the physical formulation of **Total Stream Power**:

$$
\Omega = \gamma Q S \approx \gamma (k A_{\text{up}}^p) S
$$

* In small headwaters (low $A_{\text{up}}$), slope variations exert minimal influence on depth because total kinetic energy is limited.
* In mid-to-large basins (high $A_{\text{up}}$), high slope creates intense unit stream power ($\omega = \Omega / W$), triggering deep vertical incision into bedrock or coarse alluvium and producing distinct step-pool or riffle-pool geometries.

#### 2. Soil Texture–Aridity Index Interaction

* In **humid climates** (high precipitation, low aridity), dense riparian canopy and root networks reinforce bank strength regardless of soil texture, stabilizing moderate depth exponents ($f \approx 0.36\text{--}0.40$).
* In **semi-arid and arid regions** (high aridity), the absence of dense vegetative root networks amplifies the role of soil texture. Coarse, non-cohesive sandy banks erode rapidly, producing wide, shallow braided channels ($f < 0.28, b > 0.55$), whereas localized clay-rich playa soils maintain incised, box-canyon channel forms ($f > 0.45$).

---

## Synthesis with Fluvial Geomorphic Theory

The learned relationships within the v1.0 machine learning ensemble closely replicate classical geomorphic balance principles:

```
                      LANE'S BALANCE OF EQUILIBRIUM
                           Q · S ∝ Qs · D50
                               ▲
                              / \
                             /   \
                            /     \
                  [ Water Flow ]   [ Sediment Load ]
                   Water Volume     Sediment Amount
                   Channel Slope    Grain Size (D50)
```

1. **Lane's Balance ($Q \cdot S \propto Q_s \cdot D_{50}$)**:
    * The ML model captures how channels adjust depth to balance water stream power ($Q \cdot S$) against sediment caliber ($D_{50}$) and sediment supply ($Q_s$).
2. **Tractive Force Theory**:
    * Boundary shear stress distribution ($\tau_0 = \gamma R S$) is accurately partitioned between bed and bank resistance based on soil cohesiveness and channel slope.
3. **Continuity Compliance**:
    * By learning FHG exponent relationships within the unified multi-stage pipeline, the model ensures physical consistency where depth ($f$), width ($b$), and velocity ($m$) scale cooperatively to satisfy mass conservation across continental river networks.

---

## Section Navigation

- [Depth v1.0 Overview](index.md) — Problem statement, FHG continuity formulation, and summary.
- [Model Architecture](models.md) — Candidate ML models, feature engineering, and the 3-tier Stacking Meta-Learner.
- [Model Skill & Evaluation](skill.md) — Continental USGS validation, NNSE distributions, max flow diagnostics, and literature benchmarking.
