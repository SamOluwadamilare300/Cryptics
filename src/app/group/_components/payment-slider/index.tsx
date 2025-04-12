'use client'

import { SwiperSlide } from "swiper/react"
import { Slider } from '@/components/global/slider'
import CreateGroup from "@/components/forms/create-group"

export function PaymentSlider({
  paymentMethods,
  userId,
  affiliate
}: {
  paymentMethods: Array<{ id: string; title: string; description: string; icon: string }>
  userId: string
  affiliate: any
}) {
  return (
    <Slider
      spaceBetween={20}
      slidesPerView={1.2}
      centeredSlides
      slideToClickedSlide
      breakpoints={{
        640: { slidesPerView: 1.5, spaceBetween: 30 },
        1024: { slidesPerView: 2, spaceBetween: 40 }
      }}
    >
      {paymentMethods.map((method) => (
        <SwiperSlide key={method.id}>
          <div className="p-6 bg-themeDark rounded-xl border border-themeGray h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{method.icon}</span>
              <h3 className="font-bold text-themeTextWhite">{method.title}</h3>
            </div>
            <p className="text-themeTextGray mb-6">{method.description}</p>
            
            <CreateGroup
              userId={userId}
              affiliate={affiliate.status === 200}
              stripeId={affiliate.user?.Group?.User.stripeId || ""}
            />
          </div>
        </SwiperSlide>
      ))}
    </Slider>
  )
}