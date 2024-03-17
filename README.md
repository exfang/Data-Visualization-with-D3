# Background

Flat buyers are interested in the resale price distribution based on location and how different flat types' resale prices have changed from 2000 to May 2023. You are tasked to create a visualization using D3 and provide insights and recommendations based on past resale prices.

Dataset Information:

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/74c2d8be-d967-4240-8e48-df8efd19fc26)

The data contains the resale price of HDB flats and the location from 2000 to 2023 May.

- Month: Stored in YYYY-MM Format
- Town: Singapore Towns such as Ang Mo Kio, Bishan, etc.
- Flat Types: 1 Room, 2 Room, ..., Executive, Generational.
- Block: Flat Block Number
- Street Name: Flat Street
- Storey_range: Flat story in a range
- Floor_area_sqm: Flat size
- Flat_model: Improved, New Generation, Standard, ...
- Lease_commence_date: Date the flat was leased
- Resale_price: The resale price of the flat

## Guide on running the project locally

1. Clone the repository on VSCode (or any other programming software with in-built live servers).
2. Install Live Server
3. Right-click the index.html and press 'Open with Live Server'
    
## Analysis

I analyzed the HDB resale price and units sold in different flat types and towns. I excluded 1 ROOM and MULTI-GENERATION flat types as they have a high percentage of null values in the dataset.
Below is the final D3 Dashboard

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/19fb403d-6a59-4aff-9a67-80781323911d)

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/d8bfeffa-b9b7-43a1-a927-31a9080afb38)

Looking at the units sold, there was a peak in transactions in 2012 and a recent post-COVID peak in 2021. Additionally, the 5-room flat size has overtaken the 3-room flat size as the 2nd most popular room type sold. This shift in demand could be due to people wanting a larger living space due to a shift from onsite to hybrid working, study arrangements, or higher disposable income compared to two decades ago. 

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/e58c1abb-0f3f-4141-bc58-49ba5f90fe58)

The line represents the Units Sold while the bar represents the Average Resale Price. The highest resale transaction towns are Woodlands, Tampines, and Jurong West. They are larger towns with good public amenities such as Polyclinics, Library, and Schools. These amenities are possible reasons for driving the high resale transactions.

Central Area and Queenstown have the highest average resale price of all flat types.

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/de6e2b6b-d901-4cc4-bf95-b440b059bc04)

Let's look at recent resale trends from 2018 to 2023 (pre to post-COVID).

As we know, COVID-19 affected the economy badly in 2020. The Lockdown and different social distancing measures caused many buyers to view the flats offsite, delaying or preventing their buying decision. 

As seen from the line chart, the resale prices of all flat types increased by a minimal 25% from 2020 to 2023 due to the pent-up demand during the COVID period.

Next, looking at the distribution of resales flat type on the pie chart, I noticed that the transactions from 4 rooms and higher contributed to 75% of the total sold post covid, 2020 onward, as compared to 69% of the total sold, pre-COVID, 2019, and earlier. 

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/7a668be8-b90d-4f1d-b3ee-39c9fdfe47df)

Even with price increases, flat owners are going to larger-size flats as they become more of a necessity with increasing hybrid working and study arrangements.

Moving on, I will analyze the 4-room flats as they have the most units sold. Looking at the chart below, Seng Kang, Punggol, and Yishun have the highest number of resale transactions. They also have an average resales price ranging from $410K to $500. Newer estates and more affordable pricing may be the two driving buying factors for buyers. 

![image](https://github.com/exfang/Data-Visualization-with-D3/assets/98097965/5d721a25-d474-4233-9f31-f2a5f92e32d9)

More centrally located and matured estate resales price range around 610 to 690k in Toa Payoh and Bukit Merah which may not be affordable to many, resulting in fewer transactions probably due to the higher price and shorter lease duration left. 

## Recommendations

Based on my analysis, I would like to put forward a few recommendations:
1.	For the buyers, I recommend that they act fast as prices are likely to continue increasing.
2.	For Financial institutions like banks, I recommend them to offer favorable loan interest rates for a first-time homeowner, to help them purchase their first flat
3.	For HDB, I recommend them tearing down old flats in mature towns like Bukit Mera and Toa Payoh to build 4-room or bigger flats to cater to mass preferences.

## Additional Information

I organized my codes by adopting an object-oriented approach so that the codes were cleaner and used eventlisteners to add interactivity to the dashboard.
