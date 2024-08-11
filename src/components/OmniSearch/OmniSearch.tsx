import { useDebounce } from "@uidotdev/usehooks";
import fuzzysort from "fuzzysort";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const mockTags = [
  "test",
  "second test",
  "secondish test",
  "banana",
  "bigBanana"
].map(v => ({ text: v }))

async function mockTagsApi() {
  return new Promise<{ text: string }[]>(resolve => {
    setTimeout(() => {
      resolve(mockTags);
    }, 500)
  })
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
  const [tagSearchResults, setTagSearchResults] = useState<string[]>([]);

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

        if (debouncedInput.startsWith("tag:")) {
          // TODO: Search tags for given text
          const results = fuzzysort.go<{ text: string }>(debouncedInput.split(':')[1], await mockTagsApi(), {
            key: "text",
            threshold: 0.75,
            limit: 20
          }).map(v => v.obj.text)
          setTagSearchResults(results);
        } else {
          setTagSearchResults([]);
        }
      } else {
        // TODO: Handle input clear
      }
    })()
  }, [debouncedInput])

  const handleContentEditableInput: React.FormEventHandler<HTMLDivElement> = (e) => {
    const text = (e.target as HTMLDivElement).innerText;
    setCurrentInput(text);
  }

  const handleEditableFocus = () => {
    setHasFocus(true);
  }

  const handleEditableBlur = () => {
    // TODO: don't blur parent if a tag is now focused
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

  const handleEditableKeydown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (!editableRef.current) return;
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();

      if (/^(t|tag):/.test(currentInput)) {
        const tag = currentInput.split(":")[1]
        if (!tag.length) return;
        setTags([...tags, tag])
        editableRef.current.innerHTML = "";
        setCurrentInput("");
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
      console.log("down")
    }
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
        tagSearchResults.map(tag => <button
          type="button"
          className="flex justify-start box-border p-1 w-full hover:bg-blue-100"
          key={tag}
        >{tag}</button>)
      }</div>}
    </div>
  </div>
}