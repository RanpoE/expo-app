import { useState } from "react"
// Components imports
import { FlatList, Image, Platform, Pressable, StyleSheet } from "react-native"
// Asset imports
import { stormSurge, warning } from "../assets"

const EmojiList = ({ onSelect, onCloseModal }) => {
    const [emoji] = useState([
        stormSurge, warning
    ])
    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={Platform.OS === 'web'}
            data={emoji}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item, index }) => {
                return (
                    <Pressable
                        onPress={() => {
                            onSelect(item);
                            onCloseModal()
                        }}>
                        <Image source={item} key={index} style={styles.image} />
                    </Pressable>
                );
            }}
        />
    )
}

export default EmojiList

const styles = StyleSheet.create({
    listContainer: {
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    image: {
        height: 100,
        marginRight: 20,
        width: 100,
    },
});