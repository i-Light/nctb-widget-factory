import streamlit as st
import plotly.graph_objects as go
import pandas as pd
### TODO This is how to run the app:
"""
streamlit run scripts/dev_sandbox/saas_simulator.py --server.runOnSave true
"""

# ==============================================================================
# 0. EDITABLE BASELINE CONFIGURATION (CHANGE YOUR DEFAULTS HERE)
# ==============================================================================
CURRENCY = { 
    "$-USD": 1.0,
    "£-EGP": 54.0,
    # "৳-BDT": 124.0,
    "QAR":3.64,
}

PRICE_STANDARD = 200.0 / CURRENCY["£-EGP"]   # $/mo for Standard Pro Tier
PRICE_PREMIUM = 600.0 / CURRENCY["£-EGP"]  # $/mo for Premium Custom-Design & Priority Support Tier

BASELINE = {
    "n_std": 1,          # Standard subscribers
    "n_prem": 0,         # Premium subscribers
    "spending": 20.0,    # $/mo total spending (AI, WhatsApp API, field marketing)
    "percentage of subscriptions discounts": 40,
    "discount percentage": 30,
    "my share percentage": 90,
    "paying students per subscriber": 60,
    "total spending per student": 99.0 / CURRENCY["£-EGP"],
}


# ==============================================================================
# PAGE SETUP & STYLING
# ==============================================================================
st.set_page_config(
    page_title="Students SaaS — Financial Simulator",
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


# ==============================================================================
# SECTION 2 (LEFT/TOP): INTERACTIVE KNOBS, SLIDERS & SPLIT CONTROLS
# ==============================================================================

st.space(8)
p_col1, p_col2, p_col3, = st.columns([1, 1, 1], gap="large")

kpi_box2 = st.container()

with p_col2:
	selected_currency = st.radio(
					"💵 Currency",
					options=list(CURRENCY.keys()),
					index=1,
					horizontal=True,
	)
with p_col3:
    user_share = st.slider(
					f"✌🏻 My share percentage %", 
					min_value=0,
					max_value=100,
                    value=BASELINE["my share percentage"], 
                    step=1,
                    format="%d /💯"
                    )
  
  
with kpi_box2:
	with p_col1:
            tier_col1, tier_col2 = st.columns(2)
            with tier_col1:
                price_std = st.slider(
                        f"✨ Standard Price ({selected_currency[0]}/mo)", 
                        min_value=0.0,
                        max_value=800.0 *CURRENCY[selected_currency] / CURRENCY["£-EGP"],
                        value=PRICE_STANDARD*CURRENCY[selected_currency], 
                        step=10.0 if CURRENCY[selected_currency]!=1 else 1.0,
                        format=selected_currency[0]+("%0.1f" if CURRENCY[selected_currency]==1 else " %0.0f"),
                        )
            with tier_col2:
                price_prem = st.slider(
                        f"💎 Premium Price ({selected_currency[0]}/mo)", 
                        min_value=0.0,
                        max_value=1500.0 *CURRENCY[selected_currency] / CURRENCY["£-EGP"],
                        value=PRICE_PREMIUM*CURRENCY[selected_currency], 
                        step=10.0 if CURRENCY[selected_currency]!=1 else 1.0,
                        format=selected_currency[0]+("%0.1f" if CURRENCY[selected_currency]==1 else " %0.0f"),
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
					f"✨ Standard Tier Subs", 
					min_value=0,
					max_value=50,
					value=BASELINE["n_std"],
					step=1,
			)
		with tier_col2:
			n_prem = st.slider(
					f"💎 Premium Tier Subs", 
					min_value=0,
					max_value=25,
					value=BASELINE["n_prem"],
					step=1,
			)
		operational_costs = float(
				st.slider(
						f"🚧 Operational Monthly Costs ({selected_currency[0]}/mo)",
						min_value=0.0,
						max_value=250*CURRENCY[selected_currency],
						value=float(BASELINE["spending"]*CURRENCY[selected_currency]),
						step=5.0,
						help="Total Vision AI, WhatsApp API, hosting, and field sales spend",
                        format="",
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
                format="%d /💯"
                # help="Total Vision AI, WhatsApp API, hosting, and field sales spend (Baseline: $325/mo)",
        )
)
    
with ctrl_col3:
    num_of_students = float(
        st.slider(
                "👥 Number of Students",
                min_value=0,
                max_value=200,
                value = int(BASELINE["paying students per subscriber"]),
                step=5,
        )
    )
    total_spending_per_student = float(
        st.slider(
                f"💵 Total Spending per Student ({selected_currency[0]}/mo)",
                min_value=0.0,
                max_value=10.0*CURRENCY[selected_currency],
                value = float(BASELINE["total spending per student"])*CURRENCY[selected_currency],
                step= 0.1 if CURRENCY[selected_currency]==1 else 10.0,
                format=selected_currency[0]+("%0.1f" if CURRENCY[selected_currency]==1 else " %0.0f"),
        )
    )

st.space(12)

# ==============================================================================
# CORE FINANCIAL CALCULATIONS (LIVE + BASELINE DELTAS)
# ==============================================================================
# Live scenario values
total_subscribers = n_std + n_prem
standard_subscription_revenue = n_std * price_std
premium_subscription_revenue = n_prem * price_prem
gross_subscription_revenue = standard_subscription_revenue + premium_subscription_revenue
subscription_discount_amount = gross_subscription_revenue * discount_percentage * percentage_of_subscriptions_discounts * 0.0001
in_app_micro_revenue_cuts = total_subscribers * num_of_students * total_spending_per_student
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

shareholder_share = 100-user_share
user_payout = gross_subscription_revenue + in_app_micro_revenue_cuts * user_share*0.01
shareholder_payout = in_app_micro_revenue_cuts*shareholder_share*0.01

with kpi_box:
    k1, k2, k3, k4= st.columns(4)
    k20, k21, k22 = st.columns(3)

    k1.metric(
        "👤 Active Subscribers",
        f"{total_subscribers}",
        f"{n_std} + {n_prem:,.0f} Premium Teachers",
        delta_color="normal",
				delta_arrow="off",
    )
    k2.metric(
        f"💰 Revenue",
        f"{selected_currency[0]}{gross_revenue:,.0f}/mo",
        help="Total money income before cutting anything from it"
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
        f"{selected_currency[0]}{in_app_micro_revenue_cuts-shareholder_payout:,.0f}/mo",
        f"Total Discounts = {selected_currency[0]}{shareholder_payout:,.0f}/mo",
        delta_color="red",
        delta_arrow="off",
    )
    k20.metric(
        f"💸 Profit (8 Months / 12)",
        f"{selected_currency[0]}{(user_payout*2/3)-total_spending:,.0f}/mo",
        f"Total Spent = {selected_currency[0]}{total_spending:,.0f}/mo", 
        delta_color="inverse", delta_arrow="off",
        help="How much money I actually get per month considering the months with no income and spending keeps going each month"

    )
    k21.metric(
        f"Payout revenue ({user_share:.2f}%)",
        f"{selected_currency[0]}{user_payout:,.0f}/mo",
        f"{selected_currency[0]}{user_payout-total_spending:,.0f}",
        delta_color="inverse", delta_arrow="off",
        help="My cut of the money per month before taking cutting off spending and normalizing the profit for a year",
    )
    k22.metric(
        f"🙋🏻 ShareHolder Payout ({shareholder_share:.2f}%)",
        f"{selected_currency[0]}{shareholder_payout:,.0f}/mo",
        f"Profit (8 Months / 12) = {selected_currency[0]}{shareholder_payout*2/3:,.0f}/mo",
    )


