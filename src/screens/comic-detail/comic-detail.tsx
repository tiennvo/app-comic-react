import { Button, Divider, Header, Icon } from "@components";
import { useLoading, useTheme } from "@hooks";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppSelector } from "@redux";
import {
  createFavouriteService,
  deleteFavoriteService,
  getComicService,
  getReviewsService,
} from "@services";
import { Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import { IComic, IReview } from "@types";
import { message } from "@utils";
import i18next from "i18next";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import comicDetailStyles from "./styles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation";

type ComicDetailScreenRouteProps = NativeStackScreenProps<
  RootStackParamList,
  "ComicDetail"
>["route"];

const ComicDetailScreen: React.FC = () => {
  const { t } = useTranslation([], { keyPrefix: "comicDetailScreen" });
  const styles = comicDetailStyles();
  const route = useRoute<ComicDetailScreenRouteProps>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const bottomInsets = insets.bottom;
  const { showLoading, hideLoading } = useLoading();
  const theme = useTheme();
  const item = route.params.item;

  const [data, setData] = useState<IComic>(item);
  const [currentReview, setCurrentReview] = useState<Array<IReview>>([]);
  const [isCallCheckReview, setIsCallCheckReview] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const favorite = useAppSelector((state) => state.favorite);
  const isFavorite = favorite.some((e) => e.comicId == item.id);

  useEffect(() => {
    getComicService(item.id, (data) => {
      setData(data);
    });
  }, []);

  useEffect(() => {
    // check
    user &&
      getReviewsService(
        {
          comicId: item.id,
          uid: user.id,
        },
        (data) => {
          setIsCallCheckReview(true);
          setCurrentReview(data);
        },
        () => {}
      );
  }, []);

  const onReview = () => {
    if (currentReview?.length == 0) {
      navigation.navigate("CreateReview", {
        comicId: item.id,
      });
    } else {
      navigation.navigate("EditReview", {
        item: currentReview[0],
      });
    }
  };

  const onSeeAllView = () => {
    navigation.navigate("ComicReviews", {
      id: item.id,
    });
  };


  const onShare = async () => {
    const url = "https://awesome.contents.com/";
    const title = "Awesome Contents";
    const message = "Truyện rất hay, cho 5 sao <3";

    const options = {
      title,
      url,
      message,
    };
    try {
      await Share.open(options);
    } catch (err) {
      console.log(err);
    }
  };

  const onFavorite = () => {
    if (isFavorite) {
      message.success(t("addedFavorite"));
      // showLoading();
      // const findFavorite = favorite.find((e) => e.comicId == item.id);
      // findFavorite &&
      //   deleteFavoriteService(
      //     findFavorite?.id,
      //     () => {
      //       hideLoading();
      //       // message.success(t("deletedFavorite"));
      //     },
      //     (error) => {
      //       hideLoading();
      //       message.error(i18next.t(error.code));
      //     }
      //   );
    } else {
      showLoading();
      user &&
        createFavouriteService(
          user?.id,
          item.id,
          () => {
            hideLoading();
            message.success(t("addedFavorite"));
          },
          (error) => {
            hideLoading();
            message.error(i18next.t(error.code));
          }
        );
    }
  };



  const imageUrls = data.content.split('\n').filter(url => url.trim() !== '');
  
  const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

  const onChaptrc = () => {
    const prevIndex = [...imageUrls].reverse().findIndex((url, index) => url.startsWith('-') && imageUrls.length - index - 1 < currentIndex);
        const actualPrevIndex = prevIndex !== -1 ? imageUrls.length - prevIndex - 1 : -1;

        if (actualPrevIndex !== -1) {
            setCurrentIndex(actualPrevIndex);

            // Cuộn đến vị trí chỉ mục trước đó
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: actualPrevIndex, animated: true });
            }
        }
  };



  const onChapsau = () => {
    const nextIndex = imageUrls.findIndex((url, index) => url.startsWith('-') && index > currentIndex);

        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);

            // Cuộn đến vị trí chỉ mục tiếp theo
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
            }
        }
  };

  return (
    <>
      <View style={styles.container}>
        <Header isBack={false} title={data.title} />
        <FlatList
          ref={flatListRef}
          data={imageUrls} // Sử dụng mảng URL đã tách
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            item.trim().startsWith('-') ? (
              // Nếu bắt đầu bằng dấu "-", hiển thị dưới dạng text
              <Text style={[styles.content, { color: 'black', fontWeight: 'bold', backgroundColor: 'yellow', padding: 2, borderRadius: 5, fontSize: 20, textAlign: 'center',}]}>{item.trim().substring(1)}</Text>
            ) : (
              // Nếu không, hiển thị dưới dạng ảnh
              <Image
                style={[styles.content, { width: '150%', height: undefined, aspectRatio: 1, alignSelf: 'center' }]}
                source={{ uri: item }}
                resizeMode="contain"
            />
            )
          )}
        />
      </View>
      <View
        style={[
          styles.buttonWrapper,
          { paddingBottom: bottomInsets > 0 ? bottomInsets : 16 },
        ]}
      >
        <Button
          onPress={onSeeAllView}
          style={styles.btnReview}
          title={t("seeReviews")}
          uppercase
        />
        <Button
          onPress={onReview}
          style={styles.btnReview}
          title={t("writeAReview")}
          uppercase
        />
        <Button
          onPress={onChaptrc}
          style={styles.btnChaptrc}
          title={t("chaptrc")}
          uppercase
        />
        <Button
          onPress={onChapsau}
          style={styles.btnChapsau}
          title={t("chapsau")}
          uppercase
        />
        <Button
          onPress={onShare}
          style={styles.btnShare}
          title={t("share")}
          uppercase
        />
        <Button
          disabled={!isCallCheckReview}
          style={styles.btnFavortie}
          onPress={onFavorite}
          title={t("favorite")}
          uppercase
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    marginBottom: 10,
    fontSize: 16,
    color: 'orange',         // Chữ màu cam
    fontWeight: 'bold',      // Chữ đậm
    backgroundColor: 'yellow', // Nền vàng
    padding: 10,             // Khoảng cách giữa chữ và viền
    borderRadius: 5,
  },
});

export default ComicDetailScreen;
