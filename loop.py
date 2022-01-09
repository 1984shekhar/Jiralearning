print("while loop")
i = 1
while i < 6:
  print(i)
  i += 1

print("for loop")
fruits = ["apple", "banana", "cherry"]
print("length of array fruits: "+str(len(fruits)))
for x in fruits:
  print(x)

print("for loop with range and default increment of 1")
for x in range(6):
  print(x)

print("for loop with range and increment of 3")
for x in range(2, 10, 3):
  print(x)