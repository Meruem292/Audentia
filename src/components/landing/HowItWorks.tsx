import { Card, CardContent } from "@/components/ui/card";

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your EcoVend account to get your unique 6-digit ID.",
    },
    {
      step: 2,
      title: "Find a Machine",
      description: "Locate one of our partner reverse vending machines near you.",
    },
    {
      step: 3,
      title: "Enter Your ID",
      description: "Type your 6-digit ID on the machine's numpad to link it to your account.",
    },
    {
      step: 4,
      title: "Deposit & Earn",
      description: "Deposit your plastic bottles. Points are automatically added to your account!",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple Steps to Start Earning</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Getting started with EcoVend is as easy as 1-2-3-4.
            </p>
          </div>
        </div>
        <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-12">
          {steps.map((step) => (
            <Card key={step.step}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
