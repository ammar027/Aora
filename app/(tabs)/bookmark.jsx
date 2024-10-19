import React, { useState } from "react";
import { Text, FlatList, TouchableOpacity, View, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dummyBookmarks = [

];

const EmptyState = ({ title, subtitle }) => (
  <View className="flex justify-center items-center mt-20">
    <Text className="text-white text-2xl font-psemibold">{title}</Text>
    <Text className="text-gray-400 mt-2">{subtitle}</Text>
  </View>
);

const BookmarkCard = ({ title, thumbnail, onRemove }) => (
  <View className="flex flex-row items-center justify-between p-4 bg-secondary mb-4 rounded-lg">
    <View className="flex flex-row items-center">
      <Image source={{ uri: thumbnail }} className="w-16 h-16 rounded-lg" />
      <Text className="text-white font-pregular ml-4">{title}</Text>
    </View>
    <TouchableOpacity onPress={onRemove}>
      <Text className="text-red-500">Remove</Text>
    </TouchableOpacity>
  </View>
);

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState(dummyBookmarks); // Using dummy bookmarks

  const handleRemoveBookmark = (id) => {
    setBookmarks(bookmarks.filter((item) => item.id !== id)); // Remove logic
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#161622', paddingHorizontal: 26, paddingVertical: 20 }}>
      <StatusBar backgroundColor="#161622" barStyle="light-content" />
      <Text className="text-2xl text-white font-psemibold">Bookmarks</Text>

      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookmarkCard
              title={item.title}
              thumbnail={item.thumbnail}
              onRemove={() => handleRemoveBookmark(item.id)} // Remove logic
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <EmptyState
          title="No Bookmarks"
          subtitle="You haven't bookmarked any videos yet."
        />
      )}
    </SafeAreaView>
  );
};

export default Bookmark;
