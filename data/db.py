import sqlite3
import json
import codecs
 
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
 
connection = sqlite3.connect("lib.db")
connection.row_factory = dict_factory
 
cursor = connection.cursor()
 
#cursor.execute("select * from items where id < 10000")
#cursor.execute("select * from items where id >= 10000 and id <= 20000")
#cursor.execute("select * from items where id > 20000 and id <= 70000")
#cursor.execute("select * from items where id > 70000 and id <= 120000")
cursor.execute("select * from items where id > 120000")
 
results = cursor.fetchall()
 
with codecs.open('items.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False)
 
connection.close()