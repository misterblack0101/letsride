import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import ContactForm from '@/components/contact-form';
import BrandLogo from '@/components/brand-logo';

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Brand Logo Header */}
      <div className="text-center mb-12">
        <BrandLogo size="xl" className="justify-center mb-6" />
        {/* <h1 className="text-4xl font-bold font-headline mb-4">About Let's Ride</h1> */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your trusted partner for premium cycling experiences across India
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <Card className="overflow-hidden">
             <Image
              src="https://placehold.co/800x500.png"
              alt="Let's Ride store interior"
              width={800}
              height={500}
              className="w-full object-cover"
              data-ai-hint="modern bike shop"
            />
            <CardContent className="p-6">
              <h2 className="text-2xl font-headline font-semibold mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2020, Let's Ride was born from a passion for cycling and a desire to build a community around it in India. We believe that a bicycle is more than just a mode of transport; it's a key to freedom, health, and adventure through the diverse landscapes of our beautiful country. Our mission is to provide top-quality bikes, gear, and expert service to riders of all levels, from first-timers exploring their neighborhoods to seasoned pros conquering the Himalayas.
              </p>
              <p className="text-muted-foreground">
                We're more than just a store; we're a hub for Indian cyclists. We organize group rides through scenic routes, workshops on bike maintenance, and events to bring people together and share our love for two wheels. From the bustling streets of Mumbai to the serene hills of Manali, we support riders across India.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <Image
                src="/images/pratham.jpeg"
                alt="Pratham Gupta, owner"
                width={150}
                height={150}
                className="rounded-full object-cover"
                data-ai-hint="owner portrait"
              />
              <div>
                <h3 className="text-xl font-headline font-semibold mb-2">Meet the Owner: Pratham Gupta</h3>
                <p className="text-muted-foreground">
                  Pratham is a lifelong cycling enthusiast who turned his hobby into his life's work. With over 15 years of experience in the Indian cycling industry, from competitive racing in national championships to professional bike mechanics training, Pratham's expertise is the driving force behind Let's Ride. Having cycled across various terrains from Kerala's backwaters to Ladakh's high passes, he understands the unique needs of Indian cyclists. He's always ready with a smile and expert advice to help you find the perfect bike for India's diverse conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-headline font-semibold mb-4 text-center">Get In Touch</h2>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
