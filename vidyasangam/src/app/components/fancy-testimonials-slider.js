"use client"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Transition } from "@headlessui/react"

export default function FancyTestimonialsSlider({ testimonials }) {
  const testimonialsRef = useRef(null)
  const [active, setActive] = useState(0)
  const [autorotate, setAutorotate] = useState(true)
  const autorotateTiming = 7000

  useEffect(() => {
    if (!autorotate) return
    const interval = setInterval(() => {
      setActive(active + 1 === testimonials.length ? 0 : active => active + 1)
    }, autorotateTiming)
    return () => clearInterval(interval)
  }, [active, autorotate])

  const heightFix = () => {
    if (testimonialsRef.current && testimonialsRef.current.parentElement)
      testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`
  }

  useEffect(() => {
    heightFix()
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto text-center mb-0 pb-0">
      {/* Text */}
      <div className="mb-9 transition-all duration-150 delay-300 ease-in-out">
        <div className="relative flex flex-col" ref={testimonialsRef}>
          {testimonials.map((testimonial, index) => (
            <Transition
              key={index}
              show={active === index}
              enter="transition ease-in-out duration-500 delay-200 order-first"
              enterFrom="opacity-0 -translate-x-4"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-out duration-300 delay-300 absolute"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-4"
              beforeEnter={() => heightFix()}
            >
              <div className=" m-5 text-lg font-bold text-slate-900 before:content-['\201C'] after:content-['\201D'] font-comfortaa">
                {testimonial.quote}
              </div>
            </Transition>
          ))}
        </div>
      </div>
      {/* Buttons */}
      <div className="flex flex-wrap justify-center -m-1.5">
        {testimonials.map((testimonial, index) => (
          <button
            key={index}
            className={`font-josefinSans inline-flex justify-center whitespace-nowrap rounded-full px-3 py-1.5 m-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 dark:focus-visible:ring-slate-600 transition-colors duration-150 ${
              active === index
                ? "bg-indigo-500 text-white shadow-indigo-950/10"
                : "bg-white hover:bg-indigo-100 text-slate-900"
            }`}
            onClick={() => {
              setActive(index)
              setAutorotate(false)
            }}
          >
            <span>{testimonial.name}</span>{" "}
            <span
              className={`${
                active === index ? "text-indigo-200" : "text-slate-300"
              }`}
            >
            </span>{" "}&nbsp;{"-"}&nbsp;
            <span>{testimonial.role}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
