from sklearn import datasets 
import numpy as np
import pandas as pd
from pandas import DataFrame
import statsmodels.api as sm  
import json

dataset = {}
with open('state_info.csv') as info_file:
	df = pd.read_csv(info_file)
	state_column = df['Abbreviation']
	pop_column = [int(i.replace(',', '')) for i in df['Population']]
	area_column = [int(i.replace(',', '')) for i in df['Total area']]
	density_column = [float(i.replace(',', '')) for i in df['Pop Density']]
	latitude_column = [float(i) for i in df['Latitude']]
	longitude_column = [float(i) for i in df['Longitude']]
	temp_column = [float(i) for i in df['Temperature (C)']]
	rainfall_column = [float(i) for i in df['Rainfall']]
	humidity_column = [float(i) for i in df['Humidity']]
	forest_column = [float(i) for i in df['Percent Forest']]
	arson_column = [float(i) for i in df['Arson']]

count_list = []
with open('../dataset/state_counts.json') as count_file:  
    d = json.load(count_file)
    for key in d.keys():
    	if not key in ['DC', 'PR']:
        	count_list.append(d[key])

freq_list = []
for i in range(50):
	freq_list.append(count_list[i]/area_column[i])

dataset = {'State': state_column,
			'Fires': count_list,
			'Fires/Area': freq_list,
			'Population': pop_column,
			'Area': area_column,
			'Density': density_column,
			'Latitude': latitude_column,
			'Longitude': longitude_column,
			'Temperature': temp_column,
			'Rainfall': rainfall_column,
			'Humidity': humidity_column,
			'Forest': forest_column,
			'Arson': arson_column}

df = DataFrame(dataset,columns=dataset.keys())

X = df[['Temperature', 'Density', 'Forest', 'Arson']]
Y = df['Fires/Area']
X = sm.add_constant(X) # adding a constant
 
model = sm.OLS(Y, X).fit()
predictions = model.predict(X) 
 
print_model = model.summary()
print(print_model)