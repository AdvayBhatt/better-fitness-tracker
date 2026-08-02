import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;

  confirmText?: string;

  onConfirm: () => void;
  onCancel: () => void;
};


export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {

  const { colorScheme } = useTheme();


  return (

    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >

      <View style={styles.container}>

        <ThemedView style={styles.card}>

          <ThemedText style={styles.title}>
            {title}
          </ThemedText>


          <ThemedText>
            {message}
          </ThemedText>


          <Pressable
            style={[
              styles.button,
              {
                backgroundColor:
                  Colors[colorScheme].tint,
              },
            ]}
            onPress={onConfirm}
          >

            <ThemedText style={styles.buttonText}>
              {confirmText}
            </ThemedText>

          </Pressable>


          <Pressable
            style={styles.button}
            onPress={onCancel}
          >

            <ThemedText>
              Cancel
            </ThemedText>

          </Pressable>


        </ThemedView>

      </View>

    </Modal>

  );
}



const styles = StyleSheet.create({

container:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"rgba(0,0,0,0.5)",
},

card:{
  width:"80%",
  padding:30,
  borderRadius:20,
  alignItems:"center",
  gap:20,
},

title:{
  fontSize:24,
  fontWeight:"bold",
},

button:{
  width:"100%",
  padding:15,
  borderRadius:10,
  alignItems:"center",
},

buttonText:{
  color:"white",
  fontWeight:"bold",
},

});