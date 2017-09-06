# Authentication

let users log in, logout, WITHOUT actually storing their password in your database.

2 new libraries we'll use today:

bcrypt: a tool for hashing passwords. Turns any string into a random-looking string of a fixed length. Hashing is a ONE-WAY operation, meaning that after you turn a string into a hash, there is no way to turn the hash back into a plain text string. However, you CAN try to hash another plain text password, and check if that hash matches the hash you already had stored. 

Hashing is a ONE WAY operation,
Encryption is a TWO WAY operation. If you can encrypt something, it's possible to decrypt that thing. 


alice
dragons -> abc123xyz

bob
dragons -> abc123xyz

carlos
dragons -> abc123xyz


1: guess a password - fast
2: hash her guess - slow
3: check that the hash she created matches the hash she stole

rainbow table: a huge list of common dictionary words/passwords, and the hashes for those words.

without salting: cracker's can hash passwords in advance, offline. also, if multiple users use the same password, cracking one user's password cracks all of those identical passwords. 


with salting:

alice
dragons, bbq: (dragonsbbq) -> nieotna9t8943gdhtnraios

bob
dragons, lol: dragonslol   -> t8a949gtaniowthk384htao

because we give the users random salts, the hashes in the database are all unique, even if the original passwords were not. That means that cracking each password will be laborious, and it will take a cracker twice as long to crack two passwords as it takes to crack one.

hacker: a smart computer person
cracker: a malicious computer person

