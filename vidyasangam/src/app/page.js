/* eslint-disable */

import Image from "next/image";
import NavBar from "./components/navBar";
import FancyTestimonialsSlider from "./components/fancy-testimonials-slider";
import testimonialData from "./data/testimonial.data";
import LinkedInButton from './components/linkedinButton';
import Linkedin from "./images/linkedin.png";
import Twitter from "./images/x.png";
import Instagram from "./images/insta.png";

import MentorMentee from "./images/mentorMentee.jpg";
import Leaderboard from "./images/leaderboard.png";
import Workshops from "./images/workshops.jpg";
import Roadmap from "./images/roadmap.jpg";
import MeetingSummarization from "./images/meetingSummarization.jpg";
import AutoLinkedin from "./images/autoLinkedin.jpg";
import PostForm from './components/postForm';

export default function Home() {
  return (
    <div className="overflow-x-hidden p-2">
      {/* Navigation Bar */}
      <NavBar />
      {/* <LinkedInButton /> 
      <PostForm /> */}
      {/* Header Section */}
      <div className="py-5 mt-20">
        <p className="text-[#1e3a8a] text-4xl text-center font-semibold font-comfortaa pt-5">
          VidyaSangam Mentor-Mentee Platform
        </p>
        <p className="text-center font-roboto mt-1">
          Empowering mentors to guide, and mentees to grow. Learn and develop
          together.
        </p>
      </div>

      {/* Vision Section */}
      <div>
        <p className="text-[#1e3a8a] text-2xl text-center font-semibold font-comfortaa pt-[50px]">
          Vision of the Platform
        </p>
        <p className="text-center font-roboto">
          To create a supportive environment where experienced mentors help
          students grow by sharing industry insights and guiding them through
          their learning journeys.
        </p>
      </div>

      {/* Features Section */}
      <div className="mt-12">
        <p className="text-[#1e3a8a] text-3xl text-center font-bold font-comfortaa">
          Key Features of VidyaSangam
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 px-5">
          {/* Feature 1 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={MentorMentee.src}
                alt="Mentor-Mentee Pairing"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Mentor-Mentee Pairing
            </p>
            <p className="text-center text-gray-500 mt-2">
              Comprehensive pairing based on academic and career goals.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={Leaderboard.src}
                alt="Progress Tracking"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Progress Tracking
            </p>
            <p className="text-center text-gray-500 mt-2">
              Structured mentoring sessions with progress tracking for growth.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={Workshops.src}
                alt="Workshops & Webinars"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Workshops & Webinars
            </p>
            <p className="text-center text-gray-500 mt-2">
              Access to industry insights, workshops, and live webinars.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={Roadmap.src}
                alt="Decision-Making Roadmap"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Decision-Making Roadmap
            </p>
            <p className="text-center text-gray-500 mt-2">
              A structured roadmap to make your decisions and achieve goals
              faster.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={MeetingSummarization.src}
                alt="Meeting Summarization"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Meeting Summarization
            </p>
            <p className="text-center text-gray-500 mt-2">
              Get concise summaries of meetings to enhance productivity and stay
              informed.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="flex flex-col items-center">
            <div
              className="bg-[#4f83f8] rounded-full shadow-lg"
              style={{ width: "100px", height: "100px" }}
            >
              <img
                src={AutoLinkedin.src}
                alt="Automatic LinkedIn Integration"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold mt-4 text-center">
              Automatic LinkedIn Integration
            </p>
            <p className="text-center text-gray-500 mt-2">
              Seamlessly integrate your profile and share your achievements
              directly on LinkedIn.
            </p>
          </div>
        </div>
      </div>

      {/* Mentor-Mentee Form Link */}
      <div className="text-center mt-12">
        <a
          href="/mentoring-form"
          className="bg-[#4f83f8] hover:bg-[#357ae8] text-white font-semibold py-2 px-5 rounded-lg"
        >
          Sign Up for Mentor/Mentee Classification
        </a>
      </div>

      {/* Testimonials Section */}
      <div>
        <p className="text-[#1e3a8a] text-2xl text-center font-semibold font-comfortaa pt-[50px]">
          Testimonials
        </p>
        <div className="mt-5">
          <FancyTestimonialsSlider testimonials={testimonialData} />
        </div>
      </div>

      {/* Contact Us */}
      <div className="text-center pb-32 mt-18">
        <p className="text-[#1e3a8a] text-4xl text-center font-semibold font-comfortaa pt-[50px]">
          Get in Touch
        </p>
        <p className="mt-10 font-josefinSans text-2xl">
          Have Questions about the Program?
        </p>
        <p className="font-josefinSans">
          Feel free to reach out to us for more information.
        </p>

        <div className="flex flex-row justify-center align-middle mt-5">
          <a
            href="https://www.linkedin.com/school/officialycce"
            className="mx-5"
          >
            <Image
              src={Linkedin}
              width={30}
              height={30}
              alt="VidyaSangam LinkedIn"
            />
          </a>
          <a href="https://x.com/ycceofficial" className="mx-5">
            <Image
              src={Twitter}
              width={30}
              height={30}
              alt="AIGuruKul Twitter"
            />
          </a>
          <a href="https://www.instagram.com/ctsc_ycce" className="mx-5">
            <Image
              src={Instagram}
              width={30}
              height={30}
              alt="VidyaSangam Instagram"
            />
          </a>
        </div>

        <p className="text-[#1e3a8a] text-3xl text-center font-semibold font-comfortaa pt-10">
          VidyaSangam
        </p>
        <p className="font-josefinSans">Department of Computer Technology</p>
        <p className="font-josefinSans">
          Yeshwantrao Chavan College of Engineering
        </p>
        <a
          href="mailto:VidyaSangam.edu@gmail.com"
          className="text-[#1e3a8a] font-comfortaa "
        >
          VidyaSangam.edu@gmail.com
        </a>
      </div>
    </div>
  );
}
