import React from "react"; 
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { icons } from "../../constants";
import { Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

// TabIcon Component: Memoize to avoid unnecessary re-renders
const TabIcon = React.memo(({ icon, color, name, focused }) => (
  <View className="flex items-center justify-center gap-2">
    <Image
      source={icon}
      resizeMode="contain"
      tintColor={color}
      className="w-6 h-6"
    />
    <Text
      className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
      style={{ color }}
    >
      {name}
    </Text>
  </View>
));

const TabLayout = () => {
  const { loading, isLogged } = useGlobalContext();

  // Redirect user to sign-in if not logged in and not loading
  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  // Tab screen options - extracted for cleaner code
  const screenOptions = {
    tabBarActiveTintColor: "#FFA001",
    tabBarInactiveTintColor: "#CDCDE0",
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: "#161622",
      borderTopWidth: 1,
      borderTopColor: "#232533",
      height: 84,
    },
  };

  return (
    <>
      <Tabs screenOptions={screenOptions}>
        {/** Mapping screens to avoid repetition */}
        {[
          { name: "home", icon: icons.home, title: "Home" },
          { name: "bookmark", icon: icons.bookmark, title: "Bookmark" },
          { name: "create", icon: icons.plus, title: "Create" },
          { name: "profile", icon: icons.profile, title: "Profile" },
        ].map(({ name, icon, title }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon={icon} color={color} name={title} focused={focused} />
              ),
            }}
          />
        ))}
      </Tabs>

      <Loader isLoading={loading} />
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;
