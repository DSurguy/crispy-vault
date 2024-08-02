import { useForm } from "@tanstack/react-form"
// import { invoke } from "@tauri-apps/api";
import TextInput from "../../components/form/TextInput";
import FilePickerInput from "../../components/form/FilePickerInput";
import TextareaInput from "../../components/form/TextareaInput";

type AddFileFormProps = {
  onComplete: (didCreate: boolean) => void;
}

export default function AddFileForm({ onComplete }: AddFileFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      file: null as string | null,
    },
    onSubmit: async ({ value: { name, description, file } }) => {
      console.log(name, description, file)
      onComplete(true);
    },
  })
  return <div>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();  
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={field => (<div className="mb-4">
          <label className="block" htmlFor={field.name}>Name</label>
          <TextInput
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
          {field.state.meta.errors ? (
            <div className="text-red-800">{field.state.meta.errors.filter(v => typeof v === 'string').map(v => <div key={v}>{v}</div>)}</div>
          ) : null}
        </div>)}
        validators={{
          onChange: ({value}) =>
            value.length < 1 ? 'Please enter a name for this file' : undefined,
        }}
      />
      <form.Field
        name="description"
        children={field => (<div className="mb-4">
          <label className="block" htmlFor={field.name}>Description</label>
          <div className="flex">
            <TextareaInput
              className="resize-none grow"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
          {field.state.meta.errors ? (
            <div className="text-red-800">{field.state.meta.errors.filter(v => typeof v === 'string').map(v => <div key={v}>{v}</div>)}</div>
          ) : null}
        </div>)}
      />
      <form.Field
        name="file"
        children={field => (<div className="mb-4">
          <label className="block" htmlFor={field.name}>File</label>
          <div className="flex">
            <FilePickerInput
              onChange={(file) => field.handleChange(file)}
              value={field.state.value}
            />
          </div>
          {field.state.meta.errors ? (
            <div className="text-red-800">{field.state.meta.errors.filter(v => typeof v === 'string').map(v => <div key={v}>{v}</div>)}</div>
          ) : null}
        </div>)}
        validators={{
          onChange: ({value}) =>
            !value ? 'Please select a file' : undefined,
        }}
      />
      <div className="mt-4">
        <button className="bg-gray-200 px-4 py-2 rounded-sm" type="submit">Submit</button>
      </div>
    </form>
  </div>
}