import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Leaf, BarChart } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Gift className="mb-4 h-8 w-8 text-primary" />,
      title: "Earn Rewards",
      description: "Get points for every plastic bottle you recycle. Redeem your points for exciting rewards.",
    },
    {
      icon: <Leaf className="mb-4 h-8 w-8 text-primary" />,
      title: "Help the Planet",
      description: "Contribute to a cleaner environment by reducing plastic waste. Every bottle counts!",
    },
    {
      icon: <BarChart className="mb-4 h-8 w-8 text-primary" />,
      title: "Track Your Impact",
      description: "See your recycling history and the positive impact you're making over time in your dashboard.",
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Make a Difference, Get Rewarded</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform is designed to make recycling easy, fun, and rewarding for everyone.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
