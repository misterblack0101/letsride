import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import ContactForm from '@/components/contact-form';

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold font-headline text-center mb-12">About Let's Ride</h1>
      
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
                Founded in 2020, Let's Ride was born from a passion for cycling and a desire to build a community around it. We believe that a bicycle is more than just a mode of transport; it's a key to freedom, health, and adventure. Our mission is to provide top-quality bikes, gear, and expert service to riders of all levels, from first-timers to seasoned pros.
              </p>
              <p className="text-muted-foreground">
                We're more than just a store; we're a hub for local cyclists. We organize group rides, workshops, and events to bring people together and share our love for two wheels.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <Image
                src="https://placehold.co/150x150.png"
                alt="Pratham Gupta, owner"
                width={150}
                height={150}
                className="rounded-full"
                data-ai-hint="owner portrait"
              />
              <div>
                <h3 className="text-xl font-headline font-semibold mb-2">Meet the Owner: Pratham Gupta</h3>
                <p className="text-muted-foreground">
                  Pratham is a lifelong cycling enthusiast who turned his hobby into his life's work. With over 15 years of experience in the cycling industry, from competitive racing to professional bike mechanics, Pratham's expertise is the driving force behind Let's Ride. He's always ready with a smile and expert advice to help you find the perfect bike or fine-tune your current one.
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
