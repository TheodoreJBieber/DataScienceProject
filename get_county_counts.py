'''
A separate data generation script because this one uses http requests and may take too long to run consistently
'''

import requests
import argparse
import os # to check existence of folder paths
import sqlite3
import json
import csv

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

	# county counts
	county_counts = get_county_counts(connection,outfolder)
	# print(county_counts)
	# save the state_counts to a json file


	with open(outfolder + 'county_counts.json', 'w') as outfile:
		json.dump(county_counts, outfile)

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
Gets the count of all rows for each county in the sqlite database.
Returns a json/dictionary object that are sorted by fips code
'''
def get_county_counts(sqlite_connection,outfolder):
	c=sqlite_connection.cursor()
	c.execute('SELECT COUNTY,STATE,FIPS_CODE,LATITUDE,LONGITUDE FROM Fires;') # fips code is a numerical representation of county. it is unique, whereas county names may not be

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
	
	skip = 2
	i = 0
	write = 5000
	for row in c:
		if i%write==0:
			with open(outfolder +'dump2/'+ 'county_counts_dump' + str(i) + '.json', 'w') as outfile:
				json.dump(out, outfile)
				print("Dumped at index: " + str(i))
		
		if i % skip == 1:
			if not row[2] == None: # roughly 600,000 rows do not have a fips code or a county. we want to ignore these since we can't map this data to a specific county
				bigfips = state_fips[row[1]] + row[2]
			else:
				try:
					bigfips = fetch_fips(row[3],row[4])
				except:
					bigfips =  "-1"
					print("caught error")
			out[bigfips]={'county':row[0],'state':row[1], 'count':out.get(bigfips, {'county':row[0],'state':row[1], 'count':0})['count']+1}

		i=i+1

	return out

def fetch_fips(lat, lon):
	endpoint = 'https://geo.fcc.gov/api/census/area?lat={lat}&lon={lon}&format=json'.format(lat=lat, lon=lon)
	response = requests.get(endpoint)
	
	data = response.json()['results']
	# Was nervous there might be multiple fips for a lat/lon, doesn't appear to be the case
	# if len(data) > 1:
	#     print(json.dumps(data, indent=4))

	return data[0]['county_fips']




if __name__ == "__main__":
	main()