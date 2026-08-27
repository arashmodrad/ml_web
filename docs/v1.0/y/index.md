---
title: Depth (Y) — v1.0 Overview
---

# Continental River Depth Parameterization (v1.0)

> **Publication Reference**: Modaresi Rad, A., et al. (2024). *Enhancing River Channel Dimension and Bathymetry Estimates Across Continental Scale Using Machine Learning and Functional Hydraulic Geometry*. **Journal of Geophysical Research: Machine Learning and Computation**, 1(3), e2024JH000173.

---

## Executive Summary

River channel depth ($Y$ or $d$) is the primary vertical dimension governing in-channel conveyance capacity, bed shear stress distribution, and sediment transport dynamics. Across continental river networks, accurate representation of in-channel and bankfull depth is severely hindered by the **missing bathymetry problem** in digital elevation models (DEMs). 

Version **v1.0** of the FEMA/NOAA-OWP channel geometry framework introduces a machine learning approach to parameterize continuous At-A-Station Functional Hydraulic Geometry (**FHG**) relationships ($Y = c \cdot Q^f$) across all **2.7 million+ NHDPlusV2 / COMID stream reaches** in the Conterminous United States (CONUS).

```mermaid
flowchart LR
    subgraph INPUTS ["Continental Environmental Inputs (>400 Features)"]
        direction TB
        HYD["<b>Hydrofabric & Topology</b><br/>Stream Order, Arbolate Sum"]
        SOIL["<b>Soil & Geotechnical</b><br/>Clay %, Ksat, Soil Moisture"]
        DEM["<b>DEM & Terrain</b><br/>Slope, Relief, NED Diversity"]
        CLIM["<b>Climate & Flow Stats</b><br/>MAP, Aridity, NWM Q-Quantiles"]
    end

    subgraph REDUCTION ["Dimensionality Reduction"]
        AE["<b>AutoEncoder & RFE</b><br/>Compress to ~60 Top Predictors"]
    end

    subgraph ENSEMBLE ["Multi-Tier Ensemble Modeling"]
        direction TB
        M1["<b>Tier 1: Best Single ML</b><br/>Tuned GBDT (XGBoost)"]
        M2["<b>Tier 2: Voting Ensemble</b><br/>Average of Top 6-8 Models"]
        M3["<b>Tier 3: Meta-Learner</b><br/>Stacked Learning (2nd Level)"]
    end

    subgraph OUTPUTS ["FHG & Depth Parameterization"]
        direction TB
        FHG_PARAM["<b>FHG Parameters</b><br/>Exponent <i>f</i> & Coeff <i>c</i>"]
        DEPTH_PRED["<b>Dynamic Depth Prediction</b><br/><i>Y(Q) = c &middot; Q<sup>f</sup></i>"]
        BF_DEPTH["<b>Bankfull Depth</b><br/><i>Y<sub>bf</sub></i> at <i>Q<sub>bf</sub></i>"]
    end

    INPUTS ==> REDUCTION ==> ENSEMBLE ==> OUTPUTS

    class ENSEMBLE highlight-blue;
    class M3 highlight-blue;
    class OUTPUTS highlight-teal;
```

---

## Key Highlights & Performance Metrics

| Metric / Dimension | Value / Finding | Scientific Significance |
| :--- | :--- | :--- |
| **CONUS Scope** | **2,770,000+ Reaches** | Complete high-resolution coverage across all NHDPlusV2 COMIDs |
| **Observation Base** | **3,500+ USGS / HYDRoSWOT ADCP Sites** | Quality-screened acoustic Doppler current profiler velocity-depth surveys ($R^2 \ge 0.80$) |
| **Median Test NNSE** | **$\mathbf{> 0.88}$ (Meta-Learner)** | Normalized Nash-Sutcliffe Efficiency demonstrating high predictive accuracy |
| **Extreme Flow Reliability** | **$R^2 = 0.84$ at $Q_{\max}$** | Accurate generalization at maximum observed historical flows without catastrophic saturation |
| **Regional Benchmark** | **+28% to +45% Gain over Literature** | Statistically outperforms Blackburn-Lynch et al. (2017) and Bieger et al. (2015) across all 20 HLRs |
| **Stacking Superiority** | **Meta-Learner > Voting > Best Single** | Stacked meta-learner reduces residual variance by learning regional model error correlations |

---

## The Missing Bathymetry Problem

Digital Elevation Models derived from spaceborne radar (e.g., SRTM, NASADEM) or airborne Near-Infrared (NIR) LiDAR effectively capture floodplain and valley topography. However, infrared and optical wavelengths cannot penetrate open water bodies. Consequently, elevation grids represent the **water surface elevation** at the time of data acquisition rather than the true channel bed.

```
Submerged River Cross-Section:
============================================================
              Floodplain Bank (Captured by LiDAR DEM)
                        \                /
                         \  Water Line  /  <--- NIR LiDAR Reflects Here
~~~~~~~~~~~~~~~~~~~~~~~~~~+~~~~~~~~~~~~+~~~~~~~~~~~~~~~~~~~~
                          |  MISSING   |
                          | BATHYMETRY |  <--- Unseen Inundation Volume
                          \  (Y = c·Qᶠ)/
                           \__________/
                           Channel Bed
============================================================
```

!!! danger "Hydraulic Consequences of Missing Bathymetry"
    Omitting in-channel bathymetry causes 1D and 2D hydrodynamic engines (e.g., HEC-RAS, NOAA NextGen FIM) to:
    
    1. **Underestimate In-Channel Conveyance Area ($A$)**: Low-to-moderate flows prematurely spill into overbank zones.
    2. **Overestimate Flood Extent and Inundation Depth**: Water levels artificially rise above natural flood thresholds.
    3. **Distort Boundary Shear Stress ($\tau_0 = \gamma R S$)**: Precludes realistic sediment transport, bed mobility, and roughness routing.

The **Functional Hydraulic Geometry (FHG)** framework solves this fundamental data gap by learning predictive relationships between hydro-environmental catchment drivers and the parameters governing channel depth across discharge regimes.

---

## Theoretical Formulation: Functional Hydraulic Geometry (FHG)

Following the foundational theory of Leopold & Maddock (1953), hydraulic cross-section variables (Top Width $W$, Mean Depth $Y$, and Mean Velocity $V$) scale with discharge ($Q$) as simple power-law functions:

$$
\begin{aligned}
W &= a \cdot Q^b \\
Y &= c \cdot Q^f \\
V &= k \cdot Q^m
\end{aligned}
$$

### Continuity & Exponent Sum Rules

By conservation of mass for open channel flow:

$$
Q = W \cdot Y \cdot V = (a \cdot Q^b) \cdot (c \cdot Q^f) \cdot (k \cdot Q^m) = (a \cdot c \cdot k) \cdot Q^{b + f + m}
$$

This imposes two rigorous physical continuity constraints:

$$
a \cdot c \cdot k = 1.0 \quad \text{and} \quad b + f + m = 1.0
$$

### Physical Meaning of Depth Parameters ($f$ and $c$)

* **The Depth Exponent ($f$)**: Dictates the **rate of vertical channel deepening** in response to rising discharge ($\frac{dY}{dQ} = c \cdot f \cdot Q^{f-1}$). 
    * Higher $f$ ($f > 0.40$): Deeply confined, incised, or steep-banked channels where stage rises rapidly with discharge.
    * Lower $f$ ($f < 0.30$): Wide, unconfined, or braided channels where increased discharge causes lateral overbank spreading rather than rapid deepening.
* **The Depth Coefficient ($c$)**: Represents the **characteristic depth at unit discharge** ($Q = 1\,\text{m}^3/\text{s}$ or $1\,\text{cfs}$). It scales with catchment size, longitudinal bed slope, and boundary resistance.

---

## Continental Predictions Across CONUS

Using the trained multi-tier ensemble, FHG exponent $f$, coefficient $c$, and bankfull depth $Y_{bf}$ were predicted for all ~2.77M COMID reaches across the Conterminous United States:

![Continental Reach Predictions of Channel Depth Parameters across CONUS](../../assets/images/v1.0/y/Fig3_y.png){ loading=lazy }

### Continental Geomorphic Patterns

1. **Mountainous and Headwater Systems (Rockies, Cascades, Appalachians)**:
    * Characterized by lower $f$ values and higher bed roughness, reflecting steep valley confinement and coarse cobble/boulder beds where flow energy is dissipated in turbulent resistance rather than progressive channel incision.
2. **Alluvial Lowlands and Great Plains (Mississippi, Missouri, Ohio River Basins)**:
    * Exhibit smooth downstream transitions with stable $f \approx 0.35\text{--}0.42$, indicating equilibrium alluvial regimes where depth scales predictably with cumulative discharge.
3. **Coastal Plains & Semi-Arid Southwest**:
    * Display localized variability driven by sandy, highly erodible bank materials (promoting high width adjustment $b$) versus highly cohesive clay-rich soils (promoting vertical deepening $f$).

---

## Multi-Tier Modeling Architecture

To overcome the limitations of individual ML algorithms, v1.0 deploys a three-tier stacked generalization framework:

```mermaid
graph TD
    subgraph T1 ["Tier 1: Individual Base Models (Hyperparameter-Tuned)"]
        B1["XGBoost"]
        B2["LightGBM"]
        B3["CatBoost"]
        B4["Random Forest"]
        B5["Extra Trees"]
        B6["Deep Neural Net"]
    end

    subgraph T2 ["Tier 2: Voting Ensemble"]
        VE["Equal / Weighted Average<br/>&Sigma; w<sub>i</sub> &middot; &ycirc;<sub>i</sub>"]
    end

    subgraph T3 ["Tier 3: Meta-Learner (Stacked Generalization)"]
        ML["2nd-Level Regressor<br/>Learns Non-Linear Error Residuals"]
    end

    T1 --> VE
    T1 --> ML

    class T3 highlight-blue;
    class ML highlight-blue;
```

1. **Tier 1 — Best Individual Model**: Out-of-bag tuned Gradient Boosted Decision Tree (GBDT).
2. **Tier 2 — Voting Ensemble**: Blends predictions across the top 6–8 tuned models to mitigate individual algorithm variance.
3. **Tier 3 — Meta-Learner**: Learns how individual model errors vary with catchment physiography (e.g., favoring tree models in high-relief headwaters and neural architectures in low-gradient basins), delivering the highest overall skill.

---

## Section Navigation

Explore the complete v1.0 Depth parameterization documentation across the dedicated technical sections:

<div class="grid cards" markdown>

-   :material-cpu-64-bit:{ .lg .middle } **[Model Architecture](models.md)**
    
    ---
    
    Detailed breakdown of candidate ML models, feature engineering, AutoEncoder dimensionality reduction, and the Stacking Meta-Learner architecture.
    
    [:octicons-arrow-right-24: View Model Architecture](models.md)

-   :material-chart-bell-curve-cumulative:{ .lg .middle } **[Model Skill & Evaluation](skill.md)**
    
    ---
    
    Continental USGS station validation, Normalized NSE (NNSE) distributions, extreme flow ($Q_{\max}$) scatter diagnostics, and benchmarking against Blackburn-Lynch (2017), Bieger (2015), and Doyle (2023).
    
    [:octicons-arrow-right-24: View Model Performance](skill.md)

-   :material-brain:{ .lg .middle } **[Explainable AI (XAI)](xai.md)**
    
    ---
    
    Game-theoretic SHAP global feature attributions, non-linear interaction dependencies, and physical interpretations connecting environmental drivers to channel depth dynamics.
    
    [:octicons-arrow-right-24: Explore Explainability](xai.md)

</div>

---

## References

1. **Modaresi Rad, A., et al. (2024)**. *Enhancing River Channel Dimension and Bathymetry Estimates Across Continental Scale Using Machine Learning and Functional Hydraulic Geometry*. Journal of Geophysical Research: Machine Learning and Computation, 1(3), e2024JH000173. [doi:10.1029/2024JH000173](https://doi.org/10.1029/2024JH000173)
2. **Leopold, L. B., & Maddock, T. (1953)**. *The hydraulic geometry of stream channels and some physiographic implications*. US Geological Survey Professional Paper 252.
3. **Blackburn-Lynch, W., et al. (2017)**. *Development of regional hydraulic geometry curves for the contiguous United States*. Journal of the American Water Resources Association, 53(4), 903–928.
4. **Bieger, K., et al. (2015)**. *Development of bankfull hydraulic geometry equations for the national water model*. Journal of the American Water Resources Association, 51(3), 842–856.
5. **Doyle, J. M., et al. (2023)**. *Continental-scale river geometry prediction using machine learning*. Water Resources Research, 59(4), e2022WR033621.
