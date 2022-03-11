import React, { forwardRef, MutableRefObject, RefObject, useCallback, useRef, VFC } from "react";
import { ChatZone, Section, StickyHeader } from "@components/ChatList/styles";
import { IChat, IDM } from "@typings/db";
import Chat from "@components/Chat";
import { Scrollbars } from "react-custom-scrollbars";

interface Props {
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
  scrollbarRef: RefObject<Scrollbars>;
}

const ChatList = forwardRef<Scrollbars, Props>(
  ({ chatSections, setSize, isEmpty, isReachingEnd, scrollbarRef }, scrollRef) => {
    const onScroll = useCallback((values) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        console.log("top");
        setSize((prev) => prev + 1).then(() => {
          // 스크롤 위치 유지
          const current = (scrollRef as MutableRefObject<Scrollbars>)?.current;
          if (current) {
            current.scrollTop(current.getScrollHeight() - values.scrollHeight);
          }
        });
      }
    }, []);

    return (
      <ChatZone>
        <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats]) => {
            return (
              <Section className={`section-${date}`} key={date}>
                <StickyHeader>
                  <button>{date}</button>
                </StickyHeader>
                {chats.map((chat) => (
                  <Chat key={chat.id} data={chat} />
                ))}
              </Section>
            );
          })}
        </Scrollbars>
      </ChatZone>
    );
  },
);

export default ChatList;
