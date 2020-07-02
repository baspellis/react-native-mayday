import React, {useEffect, useState, useRef} from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  Button,
  AppState,
  AppStateStatus,
  ModalProps,
  StyleSheet,
  Linking,
  StyleProp,
  ViewStyle,
  TextStyle,
  ViewProps,
  TextProps,
  TouchableWithoutFeedbackProps,
} from 'react-native';

import Store, {Mayday, MayDayButtonAction} from '../store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  body: {
    flex: 1,
  },
  message: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
  button: {
    marginTop: 8,
  },
});

export interface Props extends ModalProps {
  source: string;
  version: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  ContainerComponent?: React.ComponentType<ViewProps>;
  ContentComponent?: React.ComponentType<ViewProps>;
  BodyComponent?: React.ComponentType<ViewProps>;
  TitleComponent?: React.ComponentType<TextProps>;
  MessageComponent?: React.ComponentType<TextProps>;
  ButtonComponent?: React.ComponentType<TouchableWithoutFeedbackProps>;
  ButtonTitleComponent?: React.ComponentType<TextProps>;
}
const MaydayView = (props: Props) => {
  const [mayday, setMayday] = useState<Mayday | void>();
  const {
    source,
    version,
    containerStyle,
    contentStyle,
    bodyStyle,
    titleStyle,
    messageStyle,
    buttonStyle,
    ContainerComponent,
    ContentComponent,
    BodyComponent,
    TitleComponent,
    MessageComponent,
    ButtonComponent,
    ButtonTitleComponent,
    ...otherProps
  } = props;

  const currentState = useRef<AppStateStatus>();
  useEffect(() => {
    const handleAppStateChange = async (state: AppStateStatus) => {
      const store = new Store(source, version);
      const isStartup =
        currentState.current === undefined && state === 'active';
      const isResume =
        currentState.current === 'background' && state === 'active';
      if (!isStartup && !isResume) {
        currentState.current = state;
        return;
      }
      await store.load();
      const currentMayday = isStartup
        ? await store.startupMayday()
        : isResume
        ? await store.resumeMayday()
        : undefined;
      currentMayday?.shown();
      setMayday(currentMayday);
      currentState.current = state;
    };
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [source, version]);
  if (!mayday) {
    return null;
  }
  const {message, title, buttons} = mayday.localized();

  const handlePress = (action?: MayDayButtonAction) => () => {
    if (action && action.type === 'link') {
      const {value} = action;
      if (Linking.canOpenURL(value)) {
        Linking.openURL(value);
      }
      return;
    }
    setMayday();
  };

  const Container = ContainerComponent || View;
  const Content = ContentComponent || View;
  const Title = TitleComponent || Text;
  const Body = BodyComponent || View;
  const Message = MessageComponent || Text;
  const ButtonTitle = ButtonTitleComponent || Text;
  return (
    <Modal visible={!!mayday} animationType="slide" {...otherProps}>
      <Container style={[styles.container, containerStyle]}>
        <SafeAreaView style={styles.container}>
          <Content style={[styles.content, contentStyle]}>
            <Title style={[styles.title, titleStyle]}>{title}</Title>
            <Body style={[styles.body, bodyStyle]}>
              <Message style={[styles.message, messageStyle]}>
                {message}
              </Message>
            </Body>
            {buttons?.map((button, index) => {
              const {title: buttonTitle, action} = button;
              if (ButtonComponent) {
                return (
                  <ButtonComponent
                    key={index}
                    onPress={handlePress(action)}
                    style={[styles.button, buttonStyle]}>
                    <ButtonTitle>{title}</ButtonTitle>
                  </ButtonComponent>
                );
              }
              return (
                <View key={index} style={[styles.button, buttonStyle]}>
                  <Button title={buttonTitle} onPress={handlePress(action)} />
                </View>
              );
            })}
          </Content>
        </SafeAreaView>
      </Container>
    </Modal>
  );
};

export default MaydayView;
