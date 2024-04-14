import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random


# Generate dates with higher volumes on weekends
def generate_date_with_weekend_preference(start_date, end_date, n_rows):
    dates = []
    for _ in range(n_rows):
        date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        if date.weekday() >= 5:  # Saturday or Sunday
            if random.random() < 0.7:
                dates.append(date)
            else:
                dates.append(date - timedelta(days=random.randint(1, 2)))
        else:
            if random.random() < 0.3:
                dates.append(date)
            else:
                dates.append(date + timedelta(days=(5 - date.weekday())))

    dates = np.sort(dates)
    return dates


# Adjust sales channels
def adjust_sales_channels(dates):
    sales_channels = []
    for date in dates:
        if date.weekday() >= 5:
            if random.random() < 0.75:
                sales_channels.append("In-Store")
            else:
                sales_channels.append("Online")
        else:
            if random.random() <= 0.5:
                sales_channels.append("In-Store")
            else:
                sales_channels.append("Online")
    return sales_channels


# Adjusting product category's price
def adjust_product_details(dates):
    categories = []
    unit_prices = []
    for date in dates:
        category = random.choice(["Electronics", "Beauty & Personal Care"])
        categories.append(category)

        if category == "Electronics":
            price = round(random.uniform(100, 200), 2)
        else:
            price = round(random.uniform(10, 100), 2)
        unit_prices.append(price)
    return categories, unit_prices


def adjust_purchase_preferences(categories):
    genders = []
    for category in categories:
        if category == "Electronics":
            if random.random() < 0.75:
                genders.append("Male")
            else:
                genders.append("Female")
        else:
            if random.random() < 0.85:
                genders.append("Female")
            else:
                genders.append("Male")
    return genders


# Parameters for the dataset
n_rows = 1000
trans_ids = np.arange(1, n_rows + 1)
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 3, 19)

# Generate the data
dates = generate_date_with_weekend_preference(start_date, end_date, n_rows)
product_categories, unit_prices = adjust_product_details(dates)
gender = adjust_purchase_preferences(product_categories)
sales_channels = adjust_sales_channels(dates)

# Create the DataFrame
sales_dateset = pd.DataFrame({
    "Transaction_ID": trans_ids,
    "Date": dates,
    "Product_Category": product_categories,
    "Unit_Price": unit_prices,
    "Gender": gender,
    "Sales_Channel": sales_channels,
})

# Sort by Transaction_ID for better readability
sales_dateset.sort_values("Transaction_ID", inplace=True)

# Save the dataset
file_path = "./sales_data_1000_rows.csv"  # Change this path as needed for your local environment
sales_dateset.to_csv(file_path, index=False)

print(f"Dataset saved to {file_path}")