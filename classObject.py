class Person:
    # Note: The self parameter is a reference to the current instance of the class, and is used to access variables that belong to the class.
  def __init__(self, name, age):
    self.name = name
    self.age = age
  def myfunc(self):
    print("Hello my name is " + self.name)
p1 = Person("John", 36)
print(p1.name)
print(p1.age)
p1.myfunc()