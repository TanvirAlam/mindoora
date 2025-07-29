import bcrypt from 'bcrypt'

export const hashing = (value: string,saltNumber:number) => {
    const salt = bcrypt.genSaltSync(saltNumber);
    return bcrypt.hashSync(value,salt);
}


export const compare = (encryptValue:string,hashValue:string): boolean => {
   return bcrypt.compareSync(encryptValue, hashValue)
}
