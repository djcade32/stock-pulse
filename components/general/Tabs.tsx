import React from "react";
import { Tabs as ShadeTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = {
  label: string;
  content?: React.ReactNode;
};

interface TabsProps {
  values: Tab[];
  defaultValue?: string;
  tabClassName?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ values, defaultValue, tabClassName, onValueChange }: TabsProps) => {
  const triggers = values.map((tab, index) => (
    <TabsTrigger key={index} value={tab.label.toLocaleLowerCase()} className={tabClassName}>
      {tab.label}
    </TabsTrigger>
  ));

  const contents = values.map((tab, index) => (
    <TabsContent key={index} value={tab.label}>
      {tab.content}
    </TabsContent>
  ));
  return (
    <ShadeTabs
      defaultValue={defaultValue ? defaultValue : values[0].label.toLocaleLowerCase()}
      onValueChange={onValueChange}
    >
      <TabsList>{triggers}</TabsList>
      {contents}
    </ShadeTabs>
  );
};

export default Tabs;
