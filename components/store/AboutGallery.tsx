"use client";

import { SafeImage } from "@/components/store/SafeImage";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface AboutGalleryProps {
  images: string[];
  storeName: string;
}

export function AboutGallery({ images, storeName }: AboutGalleryProps) {
  return (
    <Swiper
      effect="coverflow"
      grabCursor
      centeredSlides
      loop={images.length > 2}
      slidesPerView="auto"
      spaceBetween={10}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      coverflowEffect={{
        rotate: 0,
        stretch: 80,
        depth: 220,
        modifier: 1.5,
        scale: 0.82,
        slideShadows: false,
      }}
      navigation={{ prevEl: ".about-gallery-prev", nextEl: ".about-gallery-next" }}
      pagination={{ clickable: true }}
      modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
      className="h-[650px]"
    >
      {images.map((image, index) => (
        <SwiperSlide key={image + index} className="!flex !w-[340px] items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-[36px] border border-white/60 bg-white p-2 shadow-[0_35px_80px_rgba(0,0,0,0.18)]"
          >
            <SafeImage
              src={image}
              alt={`${storeName} ${index + 1}`}
              width={450}
              height={550}
              className="h-[500px] w-[340px] rounded-[28px] object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}