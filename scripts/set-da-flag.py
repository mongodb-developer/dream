#!/usr/bin/env python3

"""
This script was thrown together as a Jupyter Notebook, but has been exported to run as a script.

Before running it, you should do something like this::

    python3 -m venv venv
    source venv/bin/activate
    python3 -m pip install pymongo[srv]
    export MDB_URL='YOUR-MONGODB-URL-GOES-HERE'
    python3 set-da-flag.py
"""

from os import environ
from pymongo import MongoClient

MDB_URL = environ["MDB_URL"]

client = MongoClient(MDB_URL)
db = client.get_default_database()
youtube_videos = db.youtube_videos

# The following IDs were copy-pasted from Joe D's Google Sheet from the December DA tab.
# One day, maybe this script will read them in from stdin, but for the moment, this should be fine.
IDS = """jX2IhYLa-PY
vVcb6Q6U5YY
L7HgsaObl3o
MdodfBSJ8Xk
79keZWM1F8g
_VfGoJjQ0kU
ms-2kgZbdGU
TZXPb3rsD9s
11phu1pEJm4
-sRcpGpd-0s
zya_JdZb6HQ
IpwQTN5FQ_0
BAjUOCRj03g
SFezkmAbwos
Xn80t7G1-n4
XbQvusGQbCk
yS1ZIMOEAWw
xnTez7cIZos
d-TlFo35qp8
zQ3G0Vsnbbk
OgGLl5KZJQM
YLc28Xlvyt0
CqpfNHrzEaA
eC1-16jpyEc
J2IsqYDiwFg
eC1-16jpyEc
hzzvEy5tA5I
XAY9obeZA3Q
Zmc6Fj0XO0w
2zuxdYG4978
vATR30hTZ2M
UkpaRWkPbU4
70RwHVhOhTY
cQRj0XyLrJM
CZIxU9heXYg
8feWYX0KQ9M
VqT5Wde7VMM
-gO9tvNgpu4
dAN76_47WtA
1N86Ak2uTXc
mHeP5IbozDU
TnJOSwvVZDo
cKRYK5W1Tkg
8CZs-0it9r4
wDRf2jHrCPM
4JBl-Y_7Xtg
Y9WGjiSQkt8
QgzA_9tXxy4
XUQCOf3NuJQ
rVU9EjVsrBg
uJ8uIsHoS9s
UUA0YaBdqYk
QDTZXPptvps
XAvy2BouZ1Q
3Kr_MgQAvDc
3IDlOI0D8-8
cHB8hzUSCpE
4sK5UiBQzqs
a1emK4XC5GE
nM51I6XVlTw
9hVRSnHLENU
Wp8GTyWZp-U
SnJlnT1uxLs
UVcW8tT25Rw
sx_hnMUhiHA
ddTNagnVq9M
5g4EKjtg5E4
jJmrrVqVdUM
IhT3MyF_Yfw
ETawbyIxygQ
kZ77X67GUfk
YI3l8uTkZuc
RlouET0cPsc
7HczsHW7JA0
yJE2LiCmcgk
4W5fJTyfj1Q
UMzt4PbHtm8
JCMx5SkhNVE
Ll2D5li7Aug
Ld8FFlF6klM
-8tfF06W6-o
HAtnkHw_fJ8
Z5Tdn4m9m9Q
HCFqIooKphk
8XCr89xUNEg
YJgmo3rnESE
chL4FqQlMaY
1ba3HipKb54
0rz3h1sTSW4
q9OP7Hy_nZA
y9RToSuWHFU
7y2qWbBkuz0
uvSzIZlh8O8
EF9rfN5CmoY
bkhXHiracs8
dbSXC7kdUmc
TQcqWLU01Z0
YI9LKKgybBg
xhGEwQsgGHM
1LwOGuKFRgc
ayNI9Q84v8g
Ap8elI7ePt4
rPqRyYJmx2g
4hWBLZ72qdc
W4cnTUM7uEM
gfg2wbh5_xI
wvgWKUQjiXg
aBUfQtuydTM""".splitlines()

result = youtube_videos.update_many({}, {
    '$set': {
        'isDA': False
    }
})
print(f"Set all videos to false - matched: {result.matched_count}, modified:{result.modified_count}")

result = youtube_videos.update_many({
    '_id': {
        '$in': IDS
    }
}, {
    '$set': {
        'isDA': True
    }
})
print(f"Set DA videos to true - matched: {result.matched_count}, modified:{result.modified_count}")

