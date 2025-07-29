import Image from 'next/image'
import Link from 'next/link'
import { socialIcon } from './socialIcons'

interface SocialType {
  discordLink: string
  facebookLink: string
  googleLink: string
  instagram: string
  linkedin: string
  tweeter: string
}

export const SocialNetwork = (props: SocialType) => {
  return (
    <div className='flex justify-center items-center flex-col gap-5 w-fit md:w-full h-full bg-gradient-to-r from-[#204177] to-[#1D1754] p-10'>
      <h3 className='text-2xl text-white'>Share with your friends</h3>
      <div className='flex gap-5'>
        {socialIcon.map((item, index) => {
          return (
            <Link
              key={index}
              className='flex justify-center align-middle p-4 rounded-full bg-[#191547] w-16 h-16'
              href={socialLink(item.name, props)}
            >
              <Image src={item.src} alt={item.alt} width={30} height={30} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default SocialNetwork

const socialLink = (name, props: SocialType) => {
  if (name == 'Discord') return props.discordLink
  if (name == 'Facebook') return props.facebookLink
  if (name == 'Google') return props.googleLink
  if (name == 'Instagram') return props.instagram
  if (name == 'Linkedin') return props.linkedin
  if (name == 'Tweeter') return props.tweeter
}
