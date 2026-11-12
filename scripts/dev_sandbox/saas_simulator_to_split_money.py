import streamlit as st
import plotly.graph_objects as go
import pandas as pd
### TODO This is how to run the app:
# streamlit run saas_simulator.py

# ==============================================================================
# 0. EDITABLE BASELINE CONFIGURATION (CHANGE YOUR DEFAULTS HERE)
# ==============================================================================
CURRENCY = {"$-USD": 1.0, "£-EGP": 54.0, "৳-BDT": 124.0, "QAR":3.64}

PRICE_STANDARD = 12.00   # $/mo for Standard Pro Tier
PRICE_PREMIUM = 22.00    # $/mo for Premium Custom-Design & Priority Support Tier

BASELINE = {
    "n_std": 30,          # Standard teachers
    "n_prem": 5,         # Premium teachers
    "in_app_cuts": 50.0, # $/mo from optional print/content cuts
    "spending": 20.0,    # $/mo total spending (AI, WhatsApp API, field marketing)
    "avg paying students per teacher": 60,
    "total average spending per student": 1,
    "percentage of subscriptions discounts": 40,
    "discount percentage": 30,
}

PRESET_SPLITS = {
    "Custom 6-Domain Scorecard (Use Sliders Below)": None,
    "Effort-Heavy (68.1% / 31.9%)": (0.681, 0.319),
    "Field-Sales Heavy (61.5% / 38.5%)": (0.615, 0.385),
}

DEFAULT_DOMAINS = [
    {"domain": "1. Core App, AI & WhatsApp Eng", "weight": 35.0, "user_pct": 80.0},
    {"domain": "2. Design Engine & Custom Templates", "weight": 15.0, "user_pct": 100.0},
    {"domain": "3. Strategy, Research & Scripts", "weight": 15.0, "user_pct": 75.0},
    {"domain": "4. Field Surveys & Grounding", "weight": 5.0, "user_pct": 35.0},
    {"domain": "5. In-Person Sales & Ambassadors", "weight": 20.0, "user_pct": 15.0},
    {"domain": "6. Onboarding & Priority Support", "weight": 10.0, "user_pct": 80.0},
]

# ==============================================================================
# PAGE SETUP & STYLING
# ==============================================================================
st.set_page_config(
    page_title="Teacher SaaS — Financial & Co-Founder Split Simulator",
    layout="wide",
)

st.markdown("""
<style>
    .block-container { padding-top: 1.5rem; padding-bottom: 2rem; }
    div[data-testid="stMetric"] {
        background-color: var(--secondary-background-color);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        padding: 14px 16px;
    }
</style>
""", unsafe_allow_html=True)

st.title("Teacher SaaS: Subscription, Spending & Co-Founder Split Simulator")
# st.caption(
    # f"Adjust teacher counts (${PRICE_STANDARD:.0f}/mo Standard vs. ${PRICE_PREMIUM:.0f}/mo Premium), "
    # "in-app cuts, monthly spending, and co-founder split rules in real time."
# )

# ==============================================================================
# SECTION 2 (LEFT/TOP): INTERACTIVE KNOBS, SLIDERS & SPLIT CONTROLS
# ==============================================================================
# st.subheader("1. Interactive Controls (Subscriptions, Spending & Split Mode)")
# st.divider()

st.space(8)
p_col1, p_col2, p_col3, p_col4, p_col5 = st.columns([1, 1, 0.2, 1.5, 4,], gap="medium")

kpi_box2 = st.container()

with p_col4:
	selected_currency = st.radio(
					"💵 Currency",
					options=list(CURRENCY.keys()),
					index=0,
					horizontal=True,
	)
  
with kpi_box2:
	with p_col1:
      #({selected_currency[0]}{price_std*CURRENCY[selected_currency]:.0f}/mo)
			price_std = st.number_input(f"✨ Standard Price ({selected_currency[0]}/mo)", 
																	 min_value=5.0*CURRENCY[selected_currency],
                                   max_value=100.0*CURRENCY[selected_currency],
                                   value=PRICE_STANDARD*CURRENCY[selected_currency], step=1.0, format="%0.0f")
	with p_col2:
			price_prem = st.number_input(f"💎 Premium Price ({selected_currency[0]}/mo)", 
																  min_value=10.0*CURRENCY[selected_currency],
                                  max_value=150.0*CURRENCY[selected_currency],
                                  value=PRICE_PREMIUM*CURRENCY[selected_currency], step=1.0, format="%0.0f")
      
with p_col5:
	# Custom split from the scorecard sliders (values from session_state, since the
	# sliders are drawn further down); format_func keeps the option keys stable so the
	# selection isn't reset when the percentages change.
	_w = [st.session_state.get(f"w_{i}", float(d["weight"])) for i, d in enumerate(DEFAULT_DOMAINS)]
	_u = [st.session_state.get(f"u_{i}", float(d["user_pct"])) for i, d in enumerate(DEFAULT_DOMAINS)]
	_cu = sum(w * u / 100.0 for w, u in zip(_w, _u)) / sum(_w) if sum(_w) > 0 else 0.0
	_custom_key = "Custom 6-Domain Scorecard (Use Sliders Below)"
	split_mode = st.radio(
					"🫱🏼‍🫲🏾 Select Co-Founder Split Scenario",
					options=list(PRESET_SPLITS.keys()),
					index=0,
					horizontal=True,
					format_func=lambda k: f"Custom 6-Domain Scorecard ({_cu*100:.1f}% / {(1-_cu)*100:.1f}%)" if k == _custom_key else k,
	)

st.space(12)

# ==============================================================================
# ==============================================================================


ctrl_col1, ctrl_col2, ctrl_col3 = st.columns(3, gap="large")

with ctrl_col1:
    # st.markdown("**Subscription Volume Knobs**")
		tier_col1, tier_col2 = st.columns(2)
		with tier_col1:
			n_std = st.slider(
					f"✨ Standard Tier Teachers", 
					min_value=0,
					max_value=50,
					value=BASELINE["n_std"],
					step=1,
			)
		with tier_col2:
			n_prem = st.slider(
					f"💎 Premium Tier Teachers", 
					min_value=0,
					max_value=50,
					value=BASELINE["n_prem"],
					step=1,
			)
		operational_costs = float(
				st.slider(
						f"Operational Monthly Costs ({selected_currency[0]}/mo)",
						min_value=0.0,
						max_value=250*CURRENCY[selected_currency],
						value=float(BASELINE["spending"]*CURRENCY[selected_currency]),
						step=5.0,
						help="Total Vision AI, WhatsApp API, hosting, and field sales spend",
                        format="%0.0f",
				)
	)

with ctrl_col2:
    # st.markdown("**In-App Cuts & Total Spending Knobs**")
    percentage_of_subscriptions_discounts = float(
        st.slider(
            "Percentage of Subscriptions Discounts %",
            min_value=0,
            max_value=100,
            value= int(BASELINE["percentage of subscriptions discounts"]),
            step=1,
            help="Offers to earlybird teachers and the people they invite, also this will correctly count for students taking some of the money for the subscription of the teacher they refered",
        )
    )
    discount_percentage = float(
						st.slider(
								"Discount Percentage %",
								min_value=0,
								max_value=100,
								value=int(BASELINE["discount percentage"]),
								step=5,
								# help="Total Vision AI, WhatsApp API, hosting, and field sales spend (Baseline: $325/mo)",
						)
				)
    
with ctrl_col3:
    avg_num_of_students_paying_per_teacher = float(
          st.slider(
                "👥 Average Number of Students Paying per Teacher",
                min_value=0,
                max_value=200,
                value = int(BASELINE["avg paying students per teacher"]),
                step=5,
					)
		)
    total_avg_spending_per_student = float(
							st.slider(
										f"Total Average Spending per Student ({selected_currency[0]}/mo)",
										min_value=0.0,
										max_value=10.0*CURRENCY[selected_currency],
										value = float(BASELINE["total average spending per student"])*CURRENCY[selected_currency],
										step= 0.1 if CURRENCY[selected_currency]==1 else 10.0,
                    format=selected_currency[0]+("%0.1f" if CURRENCY[selected_currency]==1 else "%0.0f"),
							)
				)

st.space(12)

# ==============================================================================
# CORE FINANCIAL CALCULATIONS (LIVE + BASELINE DELTAS)
# ==============================================================================
# Baseline values
base_rev_std = BASELINE["n_std"] * PRICE_STANDARD
base_rev_prem = BASELINE["n_prem"] * PRICE_PREMIUM
base_sub_mrr = base_rev_std + base_rev_prem
base_gross = base_sub_mrr + BASELINE["in_app_cuts"]
base_net = base_gross - BASELINE["spending"]
base_margin = (base_net / base_gross * 100.0) if base_gross > 0 else 0.0
base_user_payout = base_net * 0.677
base_shareholder_payout = base_net * 0.333

# Live scenario values
total_teachers = n_std + n_prem
standard_subscription_revenue = n_std * price_std
premium_subscription_revenue = n_prem * price_prem
gross_subscription_revenue = standard_subscription_revenue + premium_subscription_revenue
subscription_discount_amount = gross_subscription_revenue * discount_percentage * percentage_of_subscriptions_discounts * 0.0001
in_app_micro_revenue_cuts = total_teachers * avg_num_of_students_paying_per_teacher * total_avg_spending_per_student
gross_revenue = gross_subscription_revenue + in_app_micro_revenue_cuts
total_spending = operational_costs + subscription_discount_amount
net_profit = gross_revenue - total_spending
margin_pct = (net_profit / gross_revenue * 100.0) if gross_revenue > 0 else 0.0


# ==============================================================================
# SECTION 1: LIVE KPI SUMMARY BANNER (WITH DELTAS VS. BASELINE)
# ==============================================================================
st.subheader("2. Live KPI Summary & Co-Founder Payouts")

kpi_box = st.container()
st.divider()


# Optional Expandable Section for Custom 6-Domain Scorecard Sliders
custom_user_share = 0.6777
custom_shareholder_share = 0.3333
domain_rows = []

with st.expander("Customize 6-Domain Task Weights & Ownership Sliders (Scorecard Editor)", expanded=(PRESET_SPLITS[split_mode] is None)):
    st.caption("Adjust the business weight and your ownership % for each task domain. Weights are automatically normalized to 100%.")
    d_cols = st.columns(3)
    total_w = 0.0
    weighted_user = 0.0
    for idx, dom in enumerate(DEFAULT_DOMAINS):
        with d_cols[idx % 3]:
            st.markdown(f"**{dom['domain']}**")
            w = st.slider("Business Weight %", 0.0, 50.0, float(dom["weight"]), 1.0, key=f"w_{idx}")
            u_pct = st.slider("Your Task Ownership %", 0.0, 100.0, float(dom["user_pct"]), 5.0, key=f"u_{idx}")
            f_pct = 100.0 - u_pct
            total_w += w
            weighted_user += w * (u_pct / 100.0)
            domain_rows.append({
                "Domain": dom["domain"],
                "Weight": w,
                "Your Share (%)": u_pct,
                "shareholder Share (%)": f_pct,
                "Your Points": w * (u_pct / 100.0),
                "shareholder Points": w * (f_pct / 100.0),
            })
    if total_w > 0:
        custom_user_share = weighted_user / total_w
        custom_shareholder_share = 1.0 - custom_user_share
    st.info(
        f"**Scorecard Result:** Your Split = **{custom_user_share*100:.1f}%** | "
        f"shareholder's Split = **{custom_shareholder_share*100:.1f}%** (Total raw weight: {total_w:.0f}%)"
    )

# Resolve active split
if PRESET_SPLITS[split_mode] is not None:
    user_share, shareholder_share = PRESET_SPLITS[split_mode]
else:
    user_share, shareholder_share = custom_user_share, custom_shareholder_share


user_payout = net_profit * user_share
shareholder_payout = net_profit * shareholder_share

with kpi_box:
    k1, k2, k3, k4= st.columns(4)
    k21, k22 = st.columns(2)

    k1.metric(
        "👤 Active Teachers",
        f"{total_teachers}",
        f"{n_std} + {n_prem:,.0f} Premium Teachers",
        delta_color="normal",
				delta_arrow="off",
    )
    k2.metric(
        f"💸 Net Profit ({margin_pct:.1f}%)",
        f"{selected_currency[0]}{net_profit:,.0f}/mo",
        f"Total Spent = {selected_currency[0]}{total_spending:,.0f}/mo", delta_color="inverse",
				delta_arrow="off",
    )
    k3.metric(
        "⌛ Subscriptions",
        f"{selected_currency[0]}{(gross_subscription_revenue - subscription_discount_amount):,.0f}/mo",
        f"Total Discounts = {selected_currency[0]}{subscription_discount_amount:,.0f}/mo",
        delta_color="red",
        delta_arrow="off",
    )
    k4.metric(
        "💳 In App Purchases Net Revenue",
        f"{selected_currency[0]}{in_app_micro_revenue_cuts:,.0f}/mo",
    )
    k21.metric(
        f"✌🏻 Your Payout ({user_share:.2f}%)",
        f"{selected_currency[0]}{user_payout:,.0f}/mo",
    )
    k22.metric(
        f"🙋🏻 ShareHolder Payout ({shareholder_share:.2f}%)",
        f"{selected_currency[0]}{shareholder_payout:,.0f}/mo",
    )



# ==============================================================================
# SECTION 3: INTERACTIVE CHARTS & DETAILED BREAKDOWN TABLE
# ==============================================================================
st.subheader("3. Visual Breakdown: Revenue Streams, Spending & Payout Split")

chart_col2 = st.columns([1.0])[0]#, gap="large")

with chart_col2:
    # Stacked horizontal bar of the 6-Domain Co-Founder Scorecard
    df_dom = pd.DataFrame(domain_rows)
    fig_dom = go.Figure()
    fig_dom.add_trace(
        go.Bar(
            name="Your Weighted Points",
            y=df_dom["Domain"],
            x=df_dom["Your Points"],
            orientation="h",
            marker_color="#10b981",
            text=[f"{v:.1f} pts" for v in df_dom["Your Points"]],
            textposition="inside",
        )
    )
    fig_dom.add_trace(
        go.Bar(
            name="shareholder's Weighted Points",
            y=df_dom["Domain"],
            x=df_dom["shareholder Points"],
            orientation="h",
            marker_color="#f59e0b",
            text=[f"{v:.1f} pts" for v in df_dom["shareholder Points"]],
            textposition="inside",
        )
    )
    fig_dom.update_layout(
        barmode="stack",
        height=440,
        margin=dict(t=30, b=20, l=10, r=20),
        xaxis_title="Domain Weight Points (Total = 100)",
        yaxis=dict(autorange="reversed"),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        template="plotly_white",
    )
    st.plotly_chart(fig_dom, width='stretch')







