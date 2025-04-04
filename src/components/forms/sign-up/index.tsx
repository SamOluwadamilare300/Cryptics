"use client"
import { FormGenerator } from "@/components/global/form-generator"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { GROUPLE_CONSTANTS } from "@/constants"
import { useAuthSignUp } from "@/hooks/authentication"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { toast } from "sonner"

type Props = {}

const OtpInput = dynamic(
  () =>
    import("@/components/global/otp-input").then(
      (component) => component.default,
    ),
  { ssr: false },
)

const SignUpForm = (props: Props) => {
  const {
    register,
    errors,
    verifying,
    creating,
    onGenerateCode,
    onInitiateUserRegistration,
    code,
    setCode,
    getValues,
  } = useAuthSignUp()

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const captchaRef = useRef<HCaptcha>(null)

  const handleGenerateCode = async () => {
    if (!isCaptchaVerified) {
      return toast.error("Please complete the CAPTCHA verification")
    }

    try {
      await onGenerateCode(getValues("email"), getValues("password"))
      // Reset CAPTCHA after successful generation
      captchaRef.current?.resetCaptcha()
      setIsCaptchaVerified(false)
    } catch (error) {
      captchaRef.current?.resetCaptcha()
      setIsCaptchaVerified(false)
    }
  }

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setIsCaptchaVerified(true)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken(null)
    setIsCaptchaVerified(false)
  }

  return (
    <form
      onSubmit={onInitiateUserRegistration}
      className="flex flex-col gap-3 mt-10"
    >
      {verifying ? (
        <div className="flex justify-center mb-5">
          <OtpInput otp={code} setOtp={setCode} />
        </div>
      ) : (
        <>
          {GROUPLE_CONSTANTS.signUpForm.map((field) => (
            <FormGenerator
              {...field}
              key={field.id}
              register={register}
              errors={errors}
            />
          ))}
          
          {/* CAPTCHA Component */}
          <div className="my-4 flex justify-center">
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              ref={captchaRef}
            />
          </div>
        </>
      )}

      {verifying ? (
        <Button type="submit" className="rounded-2xl">
          <Loader loading={creating}>Sign Up with Email</Loader>
        </Button>
      ) : (
        <Button
          type="button"
          className="rounded-2xl"
          onClick={handleGenerateCode}
          disabled={!isCaptchaVerified || creating}
        >
          <Loader loading={creating}>Generate Code</Loader>
        </Button>
      )}
    </form>
  )
}

export default SignUpForm