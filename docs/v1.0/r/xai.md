---
title: Explainable AI & Physical Controls
description: SHAP global feature attribution, hydroclimatic interaction analysis, and physical controls governing channel cross-sectional shape exponent r in v1.0.
---

# Explainable AI (XAI) & Physical Controls — Channel Shape ($r$)

To ensure that the **v1.0 Channel Shape ($r$) Model** aligns with established principles of fluvial geomorphology and hydraulic regime theory, we apply **SHAP (SHapley Additive exPlanations)** based on cooperative game theory. SHAP attributions decompose model predictions into individual feature contributions, revealing how catchment, climate, and hydrographic factors govern cross-sectional curvature across the continental river network.

---

## Global Feature Attribution (SHAP Beeswarm Ranking)

The SHAP summary beeswarm plot ranks the most influential predictors governing the shape exponent $r$:

![SHAP Global Feature Importance Beeswarm Plot for Channel Shape r](../../assets/images/v1.0/r/r_feature_importance.png){ loading=lazy }

### Detailed Feature Attribution Analysis:

| Rank | Feature Name | Description | SHAP Directionality & Physical Mechanism |
| :---: | :--- | :--- | :--- |
| **1** | `slope` | Reach-scale bed slope | **Strongest Predictor**. High reach slope (pink/red dots) exerts a strong negative SHAP impact ($\text{SHAP} \in [-0.07, -0.01]$), forcing $r$ down toward **$r \approx 1.0$ (triangular / V-shaped)** in steep mountainous valleys where vertical incision outpaces lateral widening. Low slope (blue dots) drives positive SHAP impact ($\text{SHAP} \in [+0.01, +0.05]$), promoting **$r \ge 2.0$ (parabolic to flat-bottomed)** channels in depositional lowlands. |
| **2** | `roughness` | Baseline channel Manning's $n$ | High boundary roughness (pink/red dots) pushes SHAP values positive ($\text{SHAP} \in [+0.02, +0.13]$). Higher boundary resistance retards near-bank velocities and dissipates kinetic energy, stabilizing wider bedforms and increasing the exponent $r$. |
| **3** | `pathlength` | Flow distance to sink / ocean | High pathlength values (pink/red dots) produce negative SHAP impacts. Reaches located far inland or in steep headwater origins maintain narrower, confined cross-sections. |
| **4** | `arbolatesu` | Cumulative upstream flowline length (Arbolate sum, km) | High arbolate sum (pink/red dots) produces positive SHAP contributions ($\text{SHAP} \in [+0.01, +0.06]$). Mature, well-integrated drainage networks develop extensive alluvial plains and stable parabolic profiles. |
| **5** | `lengthkm` | Flowline reach length (km) | Longer flowline segments correlate with lower-gradient alluvial reaches, exerting positive SHAP influence on channel curvature. |
| **6** | `streamleve` | Hierarchical stream level | Differentiates mainstem river trunks from minor tributaries, controlling the cross-sectional capacity and flood wave attenuation dynamics. |
| **7** | `areasqkm` | Local catchment area ($\text{km}^2$) | Captures lateral hillslope contribution and localized tributary discharge increments along the reach. |
| **8** | `totdasqkm` | Total upstream contributing area ($\text{km}^2$) | Upstream drainage area governs total bankfull discharge volume ($Q^* \propto A^{0.75}$), shifting channels from steep headwater V-notches to wide lowland profiles. |
| **9** | `streamorde` | Modified Strahler stream order | High stream orders (mainstem rivers) systematically exhibit positive SHAP attributions, reflecting higher width-to-depth ratios and flatter bed geometry. |
| **10** | `slopelenkm` | Slope-length interaction product | Captures reach-level gravitational potential energy and stream power gradient. |
| **11** | `hwnodesqkm` | Headwater node drainage metric | Identifies first-order unbranched headwater reaches where colluvial processes and debris supply dominate channel cross-sectional form. |

---

## Sensitivity & Hydroclimatic Interaction Analysis

Fluvial cross-sectional shape is strongly governed by the non-linear interaction between soil moisture conditions, riparian vegetation, and catchment runoff volume:

![SHAP Dependence & Soil Moisture Interaction Analysis for Channel Shape r](../../assets/images/v1.0/r/r_analysis.png){ loading=lazy }

### Physical Regimes Revealed by the Interaction:

```mermaid
flowchart LR
    subgraph ARID ["Arid / Flashy Ephemeral Regime (SM_max < 0.35, RunoffCat < 150 mm)"]
        A1["Sparse Vegetation\nNon-Cohesive Sandy Bed"] --> A2["High Lateral Bank Mobility\nRapid Width Growth (b &Gt; f)"]
        A2 --> A3["High SHAP Impact (+0.005 to +0.012)\nFlat-Bottomed / Braided (r &ge; 2.0)"]
    end

    subgraph HUMID ["Humid / Perennial Equilibrium Regime (SM_max > 0.42, RunoffCat > 450 mm)"]
        H1["Dense Riparian Root Cover\nCohesive Clay-Silt Banks"] --> H2["Bank Stabilization\nDepth Incision Dominated (f &ge; b)"]
        H2 --> H3["Negative SHAP Impact (-0.005 to -0.015)\nCohesive Parabolic / V-Notch (r &approx; 1.2 - 1.8)"]
    end

    class ARID highlight-blue;
    class HUMID highlight-teal;
```

1. **Arid & Semi-Arid Ephemeral Washes ($\text{SM}_{\max} \le 0.35$, $\text{RunoffCat} < 150\text{ mm}$)**:
   * Represented by the blue cluster at the top-left of the interaction plot.
   * In arid environments with dry sandy soils and sparse riparian cover, channel banks lack cohesion and are easily eroded during high-intensity flash floods.
   * Consequently, lateral widening dominates over vertical incision ($b \gg f$), producing broad, flat-bottomed ephemeral washes with positive SHAP contributions ($\text{SHAP} > +0.005$).
2. **Humid & Perennial Basins ($\text{SM}_{\max} \ge 0.42$, $\text{RunoffCat} > 450\text{ mm}$)**:
   * Represented by the pink/red cluster at the bottom-right of the interaction plot.
   * Abundant soil moisture sustains dense riparian root matrices, while high clay fractions increase critical bank shear strength ($\tau_c$).
   * Floods are conveyed through deeper, narrower channels ($f \ge b$), yielding negative SHAP contributions ($\text{SHAP} < -0.010$) that keep the shape exponent aligned with stable parabolic and cohesive regimes ($r \approx 1.5\text{--}1.8$).

---

## Physical Controls on River Channel Shape

The XAI results confirm that the machine learning models have learned physical geomorphic dynamics rather than spurious statistical correlations:

```mermaid
graph TD
    VALLEY["<b>1. Valley Confinement & Slope</b><br/>• Steep gradients force vertical bed shear<br/>• Narrow bedrock valleys prevent widening<br/>• Drives triangular/V-shape (r &approx; 1.0)"]
    
    COHESION["<b>2. Bank Cohesion & Vegetation</b><br/>• Soil clay % + root reinforcement raise &tau;<sub>c</sub><br/>• Lowers lateral erosion rate (b &lt; f)<br/>• Maintains stable parabolic shape (r &approx; 1.75 - 2.0)"]
    
    SEDIMENT["<b>3. Sediment Transport Regime</b><br/>• Bedload dominance &rarr; Wide braided channels<br/>• Suspended-load dominance &rarr; Narrow deep channels<br/>• Governs width-to-depth aspect ratio"]
    
    HYDRO["<b>4. Flow Regime & Hydrologic Flashiness</b><br/>• Ephemeral flashiness &rarr; Flat expansive beds<br/>• Perennial stable baseflow &rarr; Equilibrium cross-sections"]

    VALLEY --> SHAPE_PARAM["<b>Dingman Shape Exponent (r)</b><br/>z(x) = Y<sub>m</sub>* &middot; (2x / W*)<sup>r</sup>"]
    COHESION --> SHAPE_PARAM
    SEDIMENT --> SHAPE_PARAM
    HYDRO --> SHAPE_PARAM

    class SHAPE_PARAM highlight-orange;
    class COHESION highlight-blue;
    class SEDIMENT highlight-teal;
```

### 1. Valley Confinement & Topographic Gradient
In headwaters and montane gorges, high bedrock confinement physically restricts lateral channel widening. Flow energy is concentrated vertically along the bed, driving downcutting and enforcing a triangular V-notch cross-section ($r \approx 1.0$).

### 2. Geotechnical Bank Cohesion & Critical Shear Stress
In alluvial plains, channel cross-sectional form reflects the balance between boundary shear stress ($\tau_0 = \gamma R S$) and the critical erodibility of bank materials ($\tau_c$). High soil moisture and clay content increase bank cohesion, allowing channels to maintain steeper sidewalls without geotechnical slumping.

### 3. Sediment Transport Mode (Bedload vs. Suspended Load)
* **Suspended-Load Channels** (high silt-clay fractions): Characterized by low width-to-depth ratios and steep, stable parabolic banks ($r \approx 1.75\text{--}2.2$).
* **Bedload-Dominated Channels** (coarse gravels and non-cohesive sands): Require wide, shallow cross-sections to transport heavy sediment loads across the bed, resulting in lower aspect ratios and broader beds ($r < 1.5$).

---

## Model Pipeline Navigation

* **[Overview & Dingman Geometry](index.md)** — Fundamentals of continuous channel power-law geometry and $r = f/b$ derivation.
* **[Model Architecture & Meta-Learners](models.md)** — Machine learning workflows, AutoEncoder feature reduction, and stacking algorithms.
* **[Model Skill & Validation](skill.md)** — Continental validation against HYDRoSWOT ADCP surveys, Kling-Gupta Efficiency CDFs, and stream-order bias analysis.
