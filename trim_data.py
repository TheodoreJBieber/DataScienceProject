# a python file that will be used to aggregate the dataset to a size and format that can easily be dealt with in the javascript files.
# sqlite is not as easy as json to use in javascript, so I figured we could convert it into different formats
# this code can be run to generate datasets from the given dataset

import argparse
import os # to check existence of folder paths
import sqlite3
import json
import csv

# SUGGESTED USAGE: trim_data.py dataset/FPA_FOD_20170508.sqlite -out ./dataset/
def main():
	# set up the necessary variables from the command line
	parsed = get_cli_arguments()
	sqlite_path = parsed.sqlite_path
	if parsed.out_folder:
		outfolder = parsed.out_folder
	else:
		outfolder = "./"
	
	# open sqlite connection
	connection = sqlite3.connect(sqlite_path)

	print("Data being read and saved:")
	# state counts
	state_counts = get_state_counts(connection)
	print(state_counts)
	# save the state_counts to a json file
	with open(outfolder + 'state_counts.json', 'w') as outfile:
		json.dump(state_counts, outfile)

	# county counts
	county_counts = get_county_counts(connection)
	print(county_counts)
	# save the state_counts to a json file
	with open(outfolder + 'county_counts.json', 'w') as outfile:
		json.dump(county_counts, outfile)

	# yearly counts
	yearly_counts = get_yearly_counts(connection)
	print(yearly_counts)
	# save the state_counts to a json file
	with open(outfolder + 'yearly_counts.json', 'w') as outfile:
		json.dump(yearly_counts, outfile)

	training_data = get_size_location_date(connection)
	# print(training_data) # Dont print because its huge
	# save to a csv file
	with open(outfolder + 'size_location_date.csv', 'w') as outfile:
		string = "FOD_ID,FIRE_SIZE,FIRE_SIZE_CLASS,LATITUDE,LONGITUDE,FIPS_CODE,STATE,STAT_CAUSE_CODE,DISCOVERY_DATE,FIRE_YEAR,DISCOVERY_DOY"
		outfile.write(string+"\n")
		for t in training_data:
			string = ""
			for element in t:
				string+=str(element)
				string+=","
			else:
				string=string[:-1] # remove comma this way because i'm lazy
				outfile.write(string+"\n")

	
	# interactive data
	interactive = get_interactive_data(connection)
	# print(interactive)#too much data to print
	# save the state_counts to a json file
	
	for skey in interactive:
		with open(outfolder+'interactive_'+skey+'.json', 'w') as outfile:
			json.dump(interactive[skey],outfile)
		
			

	# close connection
	connection.close()

'''
Parse the input arguments and return them. Access them with the returned value DOT parsed. EX: parsed=set_cli_arguments() ... print(parsed.sqlite_path)
'''
def get_cli_arguments():
	parser = argparse.ArgumentParser(description="Create several smaller data sets from the big sqlite dataset. Usage = py trim_data.py dataset/FPA_FOD_20170508.sqlite -out ./dataset/")

	parser.add_argument('sqlite_path', help="The path to the sqlite file that is being used. This assumes that it is using the dataset as described in the README.md.")
	parser.add_argument('-out', dest='out_folder', help="The path to the folder where you want the datasets to be stored once the program is finished running. Default is the current folder.")

	return parser.parse_args()


'''
Gets the count of all rows for each state in the sqlite database.
Returns a json/dictionary object with 52 states including DC(district of columbia) and PR (puerto rico)
'''
def get_state_counts(sqlite_connection):
	c=sqlite_connection.cursor()
	c.execute('SELECT STATE,COUNT(*) FROM Fires GROUP BY STATE;')

	out = {}

	for row in c:
		out[row[0]]=row[1]

	return out

'''
Gets the count of all rows for each county in the sqlite database.
Returns a json/dictionary object that are sorted by fips code
'''
def get_county_counts(sqlite_connection):
	c=sqlite_connection.cursor()
	c.execute('SELECT COUNTY,STATE,COUNT(*),FIPS_CODE FROM Fires GROUP BY FIPS_CODE;') # fips code is a numerical representation of county. it is unique, whereas county names may not be

	out = {}
	state_fips = {'AL': '01',
				  'AK': '02',
				  'AS': '60',
				  'AZ': '04',
				  'AR': '05',
				  'CA': '06',
				  'CO': '08',
				  'CT': '09',
				  'DE': '10',
				  'DC': '11',
				  'FL': '12',
				  'FM': '64',
				  'GA': '13',
				  'GU': '66',
				  'HI': '15',
				  'ID': '16',
				  'IL': '17',
				  'IN': '18',
				  'IA': '19',
				  'KS': '20',
				  'KY': '21',
				  'LA': '22',
				  'ME': '23',
				  'MH': '68',
				  'MD': '24',
				  'MA': '25',
				  'MI': '26',
				  'MN': '27',
				  'MS': '28',
				  'MO': '29',
				  'MT': '30',
				  'NE': '31',
				  'NV': '32',
				  'NH': '33',
				  'NJ': '34',
				  'NM': '35',
				  'NY': '36',
				  'NC': '37',
				  'ND': '38',
				  'MP': '69',
				  'OH': '39',
				  'OK': '40',
				  'OR': '41',
				  'PW': '70',
				  'PA': '42',
				  'PR': '72',
				  'RI': '44',
				  'SC': '45',
				  'SD': '46',
				  'TN': '47',
				  'TX': '48',
				  'UM': '74',
				  'UT': '49',
				  'VT': '50',
				  'VA': '51',
				  'VI': '78',
				  'WA': '53',
				  'WV': '54',
				  'WI': '55',
				  'WY': '56'}
	for row in c:
		if not row[3] == None: # roughly 600,000 rows do not have a fips code or a county. we want to ignore these since we can't map this data to a specific county
			out[state_fips[row[1]] + row[3]]={'county':row[0],'state':row[1], 'count':row[2]}

	return out

'''
Gets the count of all rows for each year in the sqlite database.
Returns a json/dictionary object that are sorted by year
'''
def get_yearly_counts(sqlite_connection):
	c=sqlite_connection.cursor()
	c.execute('SELECT FIRE_YEAR,COUNT(*) FROM Fires GROUP BY FIRE_YEAR;')

	out = {}

	for row in c:
		out[row[0]]=row[1]

	return out

'''
Gets all fires' size, size class, locations(latitude, longitude, fips code,state), dates(mm/dd/yyyy, year, and day of the year), and cause

Returns an array of tuples with the following fields:
	FOD_ID,FIRE_SIZE,FIRE_SIZE_CLASS,LATITUDE,LONGITUDE,FIPS_CODE,STATE,STAT_CAUSE_CODE,DISCOVERY_DATE,FIRE_YEAR,DISCOVERY_DOY

This is theoretically going to be used for the machine learning portion of the project
from the kaggle description: Given the size, location and date, can you predict the cause of a fire wildfire?
'''
def get_size_location_date(sqlite_connection):
	c=sqlite_connection.cursor()
	c.execute('SELECT FOD_ID,FIRE_SIZE,FIRE_SIZE_CLASS,LATITUDE,LONGITUDE,FIPS_CODE,STATE,STAT_CAUSE_CODE,DISCOVERY_DATE,FIRE_YEAR,DISCOVERY_DOY FROM Fires;') # FOD_ID is the global unique identifier for the fire

	out = []

	for row in c:
		out.append([row[0],row[1],row[2],row[3],row[4],row[5],row[6],row[7],row[8],row[9],row[10]])

	return out


'''
For interactive maps. Generates the data for each state
'''
def get_interactive_data(sqlite_connection):
	c=sqlite_connection.cursor()
	c.execute('SELECT FOD_ID,FIRE_SIZE,LATITUDE,LONGITUDE,STATE,FIRE_YEAR FROM Fires;') # FOD_ID is the global unique identifier for the fire

	out = {}

	for row in c:
		state = row[4]
		out[state]=out.get(state, [])
		out[state].append({"id":row[0],"size":row[1],"lat":row[2],"lon":row[3],"state":row[4],"year":row[5]})

	return out

if __name__ == "__main__":
	main()