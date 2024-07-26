import { useForm } from "@tanstack/react-form"
import TextInput from "../../components/form/TextInput"
import { useNavigate } from "react-router-dom"
import { invoke } from "@tauri-apps/api"

export default function AddAssetRoute() {
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: {
      name: '',
      file: '',
    },
    onSubmit: async ({ value: { name } }) => {
      const uuid = await invoke("create_asset", {
        name
      }) as string;
      navigate({
        pathname: `/assets/${uuid}`
      })
    },
  })

  return <div className="p-4">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();  
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={field => (<div>
          <label className="block" htmlFor={field.name}>Asset Name</label>
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
            value.length < 1 ? 'Please enter an asset name' : undefined,
        }}
      />
      <div className="mt-4">
        <button className="bg-gray-200 px-4 py-2 rounded-sm" type="submit">Submit</button>
      </div>
    </form>
  </div>
}