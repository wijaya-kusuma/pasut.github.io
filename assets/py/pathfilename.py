import os

mydir = '../../data/data_stasiun_pasut/2021/'
for root, dirs, files in os.walk(mydir):
	for file in files:
		if file.endswith('jpg'):
			path=os.path.join(root,file)
			filenameList[]=path
			print (os.path.join(root,file))