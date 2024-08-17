import { invoke } from "@tauri-apps/api/core";
import { useDebounce } from "@uidotdev/usehooks";
import fuzzysort from "fuzzysort";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

async function mockTagsApi(search: string) {
  const mockTags = [
    "test",
    "second test",
    "secondish test",
    "banana",
    "bigBanana"
  ].map(v => ({ text: v }))

  const mockApiCall = () => new Promise<{ text: string }[]>(resolve => {
    setTimeout(() => {
      resolve(mockTags);
    }, 500)
  })

  const results = fuzzysort.go<{ text: string }>(search.split(':')[1], await mockApiCall(), {
    key: "text",
    threshold: 0.75,
    limit: 20
  })

  return results;
}

const defaultTagClassName = "px-1 bg-blue-200 rounded-sm text-blue-700 font-bold";
type TagProps = { className?: string; text: string; }
const Tag = ({ className, text }: TagProps) => {
  const mergedClassName = twMerge(defaultTagClassName, className)
  return <div className={mergedClassName}>{text}</div>
}

const placeholderClassName = [
  "before:content-['Search_for_assets_and_samples_by_name_or_tag']",
  "before:absolute",
  "before:text-gray-400",
];

const outerClassName = [
  "flex",
  "rounded-md",
  "bg-gray-100",
  "py-1",
  "border",
  "border-gray-400",
].join(" ")

const outerOutline = [
  "outline",
  "outline-2",
  "outline-offset-1",
  "outline-blue-400"
]

type OmniSearchProps = {
  className?: string;
}

export default function OmniSearch({ className }: OmniSearchProps) {
  const [hasFocus, setHasFocus] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const editableRef = useRef<null | HTMLDivElement>(null);
  const [currentInput, setCurrentInput] = useState("");
  const debouncedInput = useDebounce(currentInput, 150);
  const [tagSearchResults, setTagSearchResults] = useState<{text: string, selected: boolean}[]>([]);
  const currentlySelectedIndex = tagSearchResults.findIndex(v => v.selected);

  const mergedOuterClassName = twMerge(
    outerClassName,
    hasFocus ? outerOutline : undefined,
    className
  );
  const editableClassName = twMerge("mx-2 outline-none", currentInput.length ? '' : placeholderClassName);

  useEffect(() => {
    (async () => {
      if (debouncedInput) {
        // TODO: parse to see if we have a command

        if (/^(t|tag):(.+){3}/.test(debouncedInput)) {
          console.log("wtf")
          try {
            const results = await invoke<string[]>('tag_search', {
              search: debouncedInput.split(/:/g)[1]
            });
            setTagSearchResults(
              results.map(tag => ({
                text: tag,
                selected: false
              }))
            );
          } catch (e) {
            setTagSearchResults([]);
            console.error(e);
          }
        } else {
          setTagSearchResults([]);
        }
      } else {
        if( tagSearchResults ) setTagSearchResults([]);
      }
    })()
  }, [debouncedInput])

  const handleContentEditableInput: React.FormEventHandler<HTMLDivElement> = (e) => {
    let text = (e.target as HTMLDivElement).innerText;
    if( (!text.length || /^\s+$/.test(text)) && editableRef.current ) {
      // sometimes whitespace appears, explicitly get rid of it
      editableRef.current.innerHTML = "";
      text = "";
    }
    setCurrentInput(text);
  }

  const handleEditableFocus = () => {
    setHasFocus(true);
  }

  const handleEditableBlur = () => {
    setHasFocus(false);
  }

  const handleEditableClick: React.MouseEventHandler<HTMLDivElement> = ({ detail: clicks }) => {
    if (!editableRef.current) return;
    if (clicks === 2) {
      const range = new Range();
      range.selectNodeContents(editableRef.current);
      const selection = window.getSelection();
      if (!selection) return;
      selection.empty()
      selection.addRange(range);
    }
    else if (clicks > 2) {
      // TODO: Highlight all text AND all tags (for delete or copy I guess?)
      console.log("triple+ click currently unimplemented")
    }
  }

  const confirmTag = (tag: { text: string }) => {
    setTags([...tags, tag.text])
    if (editableRef.current) editableRef.current.innerHTML = "";
    setCurrentInput("");
    setTagSearchResults([]);
  }

  const handleEditableKeydown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (!editableRef.current) return;
    
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();

      if( currentlySelectedIndex > -1 ){
        confirmTag(tagSearchResults[currentlySelectedIndex])
      }
    }

    if (e.key === "Backspace") {
      const selection = window.getSelection();
      if (!selection) return;
      if (selection.isCollapsed && selection.anchorNode === editableRef.current && selection.anchorOffset === 0) {
        e.stopPropagation();
        e.preventDefault();
        // We're on the left of the editable, nuke the last tag
        if (tags.length) setTags(tags.slice(0, -1))
      }
    }

    if (e.key === "ArrowDown" ) {
      e.stopPropagation();
      e.preventDefault();
      if( currentlySelectedIndex >= -1 && currentlySelectedIndex < tagSearchResults.length -1){
        const newTagSearchResults = tagSearchResults.map(v => ({...v}))
        if( newTagSearchResults[currentlySelectedIndex] ) newTagSearchResults[currentlySelectedIndex].selected = false;
        newTagSearchResults[currentlySelectedIndex+1].selected = true;
        setTagSearchResults(newTagSearchResults);
      }
    }

    if (e.key === "ArrowUp" ) {
      e.stopPropagation();
      e.preventDefault();
      if( currentlySelectedIndex > 0){
        const newTagSearchResults = tagSearchResults.map(v => ({...v}))
        newTagSearchResults[currentlySelectedIndex].selected = false;
        newTagSearchResults[currentlySelectedIndex-1].selected = true;
        setTagSearchResults(newTagSearchResults);
      }
    }

    if (e.key === "Escape" ) {
      if( tagSearchResults.length )
        setTagSearchResults([])
    }
  }

  const handleTagClick = (tag: { text: string }) => {
    confirmTag(tag);
  }

  return <div className={mergedOuterClassName}>
    {!!tags.length && <div className="flex ml-2">{tags.map(tag => <Tag className="mr-2 last:mr-0" key={tag} text={tag} />)}</div>}
    <div className="grow relative">
      <div
        contentEditable="plaintext-only"
        ref={editableRef}
        className={editableClassName}
        onInput={handleContentEditableInput}
        onFocus={handleEditableFocus}
        onBlur={handleEditableBlur}
        onClick={handleEditableClick}
        onKeyDown={handleEditableKeydown}
      ></div>
      {!!tagSearchResults.length && <div className="absolute top-full mt-1 ml-2 bg-gray-50 drop-shadow-md w-11/12">{
        tagSearchResults.map(tag => {
          const tagClassName = twMerge("flex justify-start box-border p-1 w-full hover:bg-blue-100", tag.selected ? 'bg-blue-100' : '')
          return <button
            type="button"
            className={tagClassName}
            tabIndex={-1}
            key={tag.text}
            onClick={() => handleTagClick(tag)}
          >{tag.text}</button>
        })
      }</div>}
    </div>
  </div>
}