"use client"
import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { BadgePlus } from "@/icons"
import Link from "next/link"
import Lottie from "lottie-react";
import LottieAnimation from "../../../../../public/cryptics.json"


type Props = {}

const CallToAction = (props: Props) => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-24">
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
        {/* Left Column - Lottie Animation */}
        <div className="w-full lg:w-1/2">
          {/* Lottie Animation Component */}
          <Lottie animationData={LottieAnimation} loop={true} />
        </div>

        {/* Right Column - Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
          <div className="inline-flex items-center rounded-full bg-themeAccent/10 px-4 py-2 text-sm font-medium text-themeAccent mb-2">
            🚀 The Future of Web2, Web3 & AI Learning
          </div>
          
          <GradientText
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-left"
            element="H1"
          >
            Master Web2 and Web3, Prompt Engineering & Automation
          </GradientText>
          
          <p className="text-lg text-themeTextGray leading-relaxed">
            Cryptics is the premier platform where innovators learn cutting-edge technologies. 
            Join expert-led groups, access exclusive courses, and collaborate with 
            like-minded builders in the, web2, Web3 and AI space.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Button
              variant="outline"
              className="rounded-xl bg-transparent border-themeGray hover:bg-themeDark/50 text-base h-12"
              size="lg"
            >
              🎥 See Platform Demo
            </Button>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button className="rounded-xl text-base flex gap-2 h-12 w-full" size="lg">
                <BadgePlus /> Start Learning
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-6 text-sm text-themeTextGray">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((item) => (
                <img
                  key={item}
                  src={`/avatars/avatar-${item}.jpg`} // Replace with your avatar paths
                  className="w-8 h-8 rounded-full border-2 border-themeDark"
                  alt={`User ${item}`}
                />
              ))}
            </div>
            <div>
              Join <span className="text-themeAccent font-medium">1,200+</span> builders already learning
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallToAction