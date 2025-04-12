import BackdropGradient from "@/components/global/backdrop-gradient"
import GlassCard from "@/components/global/glass-card"
import GradientText from "@/components/global/gradient-text"
import { GROUPLE_CONSTANTS } from "@/constants"

type Props = {
  children: React.ReactNode
}

const CreateGroupLayout = ({ children }: Props) => {
  return (
    <> 
    <div className="">
    <h5 className="text-2xl font-bold ml-4 mt-9 text-themeTextWhite">Cryptics.</h5>
    </div>
    <div className="container mt-24 h-screen grid grid-cols-1 lg:grid-cols-2 content-center">
      <div className="flex mt-32 items-center">
        <BackdropGradient className="w-8/12 h-2/6 opacity-50">
          {/* <h5 className="text-2xl font-bold text-themeTextWhite">Cryptics.</h5> */}
          <GradientText element="H2" className="text-4xl italic [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] font-semibold py-1">
           Start a Campus, Spark a Learning revolution.
          </GradientText>
          <p className="text-themeTextGray">
            Network with people from around the world, join campuses, create your own,
            watch courses and become the best version of yourself.
          </p>
          <div className="flex flex-col gap-3 mt-14 pl-5">
            {GROUPLE_CONSTANTS.createGroupPlaceholder.map((placeholder) => (
              <div className="flex gap-3" key={placeholder.id}>
                {placeholder.icon}
                <p className="text-themeTextGray">{placeholder.label}</p>
              </div>
            ))}
          </div>
        </BackdropGradient>
      </div>
      <div>
        <BackdropGradient
          className="w-6/12 h-3/6 opacity-40"
          container="lg:items-center"
        >
          <GlassCard className="xs:w-full lg:w-10/12 xl:w-8/12 mt-16 py-7">
            {children}
          </GlassCard>
        </BackdropGradient>
      </div>
    </div>
    <div className="mb-60"></div>
    </>
  )
}

export default CreateGroupLayout
