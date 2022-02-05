import time
import psycopg2

def insert_vendor_list(vendor_list):
    sql = "INSERT INTO vendors(vendor_name) VALUES(%s)"
    conn = None
    try:

        conn = psycopg2.connect(user="testuser",
                                  password="testuser",
                                  host="127.0.0.1",
                                  port="5432",
                                  database="testdb")
        # create a new cursor
        cur = conn.cursor()
        # execute the INSERT statement
        cur.executemany(sql,vendor_list)
        # commit the changes to the database
        conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

#1000 entries
for x in range(200):
    counter = str(x);
    insert_vendor_list([
        (counter+' Tata Consultancy Services',),
        (counter+' Infosys Pvt Ltd',),
        (counter+' Tech Mahindra Pvt Ltd',),
        (counter+' Flipkart',),
        (counter+' Zomato',)
    ])
    #time.sleep(1)   